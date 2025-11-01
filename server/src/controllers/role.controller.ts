import { Request, Response } from 'express';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import {
  CreateRoleInput,
  UpdateRoleInput,
  GetRolesQuery,
  CreatePermissionInput,
  UpdatePermissionInput,
  GetPermissionsQuery,
} from '../schemas/role.schemas';

// ==================== CONTRÔLEURS POUR LES RÔLES ====================

/**
 * Contrôleur pour obtenir la liste des rôles avec pagination
 */
export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page,
      limit,
      search,
      isActive,
      sortBy,
      sortOrder,
    }: GetRolesQuery = req.query as any;

    // Construction du filtre de recherche
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    // Construction du tri
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calcul de la pagination
    const skip = (page - 1) * limit;

    // Requête avec population des permissions
    const roles = await Role.find(filter)
      .populate({
        path: 'permissions',
        select: 'name resource action description',
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Comptage total pour la pagination
    const total = await Role.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        roles,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour obtenir un rôle par ID
 */
export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id).populate({
      path: 'permissions',
      select: 'name resource action description',
    });

    if (!role) {
      res.status(404).json({
        success: false,
        message: 'Rôle non trouvé',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du rôle:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour créer un nouveau rôle
 */
export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, permissions = [] }: CreateRoleInput = req.body;

    // Vérifier si le rôle existe déjà
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      res.status(409).json({
        success: false,
        message: 'Un rôle avec ce nom existe déjà',
      });
      return;
    }

    // Vérifier que les permissions existent
    if (permissions.length > 0) {
      const existingPermissions = await Permission.find({ _id: { $in: permissions } });
      if (existingPermissions.length !== permissions.length) {
        res.status(400).json({
          success: false,
          message: 'Une ou plusieurs permissions spécifiées n\'existent pas',
        });
        return;
      }
    }

    // Créer le rôle
    const role = new Role({
      name,
      description,
      permissions,
    });

    await role.save();

    // Charger le rôle avec ses permissions pour la réponse
    const createdRole = await Role.findById(role.id).populate({
      path: 'permissions',
      select: 'name resource action description',
    });

    res.status(201).json({
      success: true,
      message: 'Rôle créé avec succès',
      data: createdRole,
    });
  } catch (error) {
    console.error('Erreur lors de la création du rôle:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour mettre à jour un rôle
 */
export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateRoleInput = req.body;

    // Vérifier que le rôle existe
    const role = await Role.findById(id);
    if (!role) {
      res.status(404).json({
        success: false,
        message: 'Rôle non trouvé',
      });
      return;
    }

    // Vérifier l'unicité du nom si modifié
    if (updateData.name && updateData.name !== role.name) {
      const existingRole = await Role.findOne({ name: updateData.name });
      if (existingRole) {
        res.status(409).json({
          success: false,
          message: 'Un rôle avec ce nom existe déjà',
        });
        return;
      }
    }

    // Vérifier et convertir les permissions si spécifiées
    if (updateData.permissions && updateData.permissions.length > 0) {
      // Détecter si ce sont des IDs ou des noms
      const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
      const areIds = updateData.permissions.every(p => mongoIdRegex.test(p));
      
      if (areIds) {
        // Ce sont des IDs, vérifier qu'ils existent
        const existingPermissions = await Permission.find({ _id: { $in: updateData.permissions } });
        if (existingPermissions.length !== updateData.permissions.length) {
          res.status(400).json({
            success: false,
            message: 'Une ou plusieurs permissions spécifiées n\'existent pas',
          });
          return;
        }
      } else {
        // Ce sont des noms, les convertir en IDs
        console.log('🔄 Conversion des noms de permissions en IDs:', updateData.permissions);
        const existingPermissions = await Permission.find({ name: { $in: updateData.permissions } });
        console.log('📋 Permissions trouvées:', existingPermissions.map(p => ({ name: p.name, id: p._id })));
        
        if (existingPermissions.length !== updateData.permissions.length) {
          res.status(400).json({
            success: false,
            message: 'Une ou plusieurs permissions spécifiées n\'existent pas',
          });
          return;
        }
        
        // Remplacer les noms par les IDs
        updateData.permissions = existingPermissions.map(p => p._id.toString());
        console.log('✅ IDs de permissions:', updateData.permissions);
      }
    }

    // Mettre à jour le rôle
    const updatedRole = await Role.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: 'permissions',
      select: 'name resource action description',
    });

    res.status(200).json({
      success: true,
      message: 'Rôle mis à jour avec succès',
      data: updatedRole,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour supprimer un rôle
 */
export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) {
      res.status(404).json({
        success: false,
        message: 'Rôle non trouvé',
      });
      return;
    }

    // Empêcher la suppression des rôles système
    const systemRoles = ['Super Admin', 'Admin', 'Manager', 'User'];
    if (systemRoles.includes(role.name)) {
      res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un rôle système',
      });
      return;
    }

    await Role.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Rôle supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du rôle:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour attacher des permissions à un rôle
 */
export const attachPermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds)) {
      res.status(400).json({
        success: false,
        message: 'permissionIds doit être un tableau',
      });
      return;
    }

    // Vérifier que le rôle existe
    const role = await Role.findById(id);
    if (!role) {
      res.status(404).json({
        success: false,
        message: 'Rôle non trouvé',
      });
      return;
    }

    // Vérifier que toutes les permissions existent
    const permissions = await Permission.find({ _id: { $in: permissionIds } });
    if (permissions.length !== permissionIds.length) {
      res.status(400).json({
        success: false,
        message: 'Une ou plusieurs permissions spécifiées n\'existent pas',
      });
      return;
    }

    // Attacher les permissions (remplace les existantes)
    role.permissions = permissionIds;
    await role.save();

    const updatedRole = await Role.findById(id).populate({
      path: 'permissions',
      select: 'name resource action description',
    });

    res.status(200).json({
      success: true,
      message: 'Permissions attachées avec succès',
      data: updatedRole,
    });
  } catch (error) {
    console.error('Erreur lors de l\'attachement des permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

// ==================== CONTRÔLEURS POUR LES PERMISSIONS ====================

/**
 * Contrôleur pour obtenir la liste des permissions avec pagination
 */
export const getPermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page,
      limit,
      search,
      resource,
      action,
      isActive,
      sortBy,
      sortOrder,
    }: GetPermissionsQuery = req.query as any;

    // Construction du filtre de recherche
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
      ];
    }

    if (resource) {
      filter.resource = { $regex: resource, $options: 'i' };
    }

    if (action) {
      filter.action = { $regex: action, $options: 'i' };
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    // Construction du tri
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calcul de la pagination
    const skip = (page - 1) * limit;

    // Requête
    const permissions = await Permission.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Comptage total pour la pagination
    const total = await Permission.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        permissions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour obtenir une permission par ID
 */
export const getPermissionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const permission = await Permission.findById(id);

    if (!permission) {
      res.status(404).json({
        success: false,
        message: 'Permission non trouvée',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: permission,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la permission:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour créer une nouvelle permission
 */
export const createPermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, resource, action, description }: CreatePermissionInput = req.body;

    // Vérifier si la permission existe déjà
    const existingPermission = await Permission.findOne({ name });
    if (existingPermission) {
      res.status(409).json({
        success: false,
        message: 'Une permission avec ce nom existe déjà',
      });
      return;
    }

    // Créer la permission
    const permission = new Permission({
      name,
      resource,
      action,
      description,
    });

    await permission.save();

    res.status(201).json({
      success: true,
      message: 'Permission créée avec succès',
      data: permission,
    });
  } catch (error) {
    console.error('Erreur lors de la création de la permission:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour mettre à jour une permission
 */
export const updatePermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdatePermissionInput = req.body;

    // Vérifier que la permission existe
    const permission = await Permission.findById(id);
    if (!permission) {
      res.status(404).json({
        success: false,
        message: 'Permission non trouvée',
      });
      return;
    }

    // Vérifier l'unicité du nom si modifié
    if (updateData.name && updateData.name !== permission.name) {
      const existingPermission = await Permission.findOne({ name: updateData.name });
      if (existingPermission) {
        res.status(409).json({
          success: false,
          message: 'Une permission avec ce nom existe déjà',
        });
        return;
      }
    }

    // Mettre à jour la permission
    const updatedPermission = await Permission.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Permission mise à jour avec succès',
      data: updatedPermission,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la permission:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour supprimer une permission
 */
export const deletePermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const permission = await Permission.findByIdAndDelete(id);
    if (!permission) {
      res.status(404).json({
        success: false,
        message: 'Permission non trouvée',
      });
      return;
    }

    // Supprimer la permission de tous les rôles qui l'utilisent
    await Role.updateMany(
      { permissions: id },
      { $pull: { permissions: id } }
    );

    res.status(200).json({
      success: true,
      message: 'Permission supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la permission:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};
