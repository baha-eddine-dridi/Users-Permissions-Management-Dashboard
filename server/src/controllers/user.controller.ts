import { Request, Response } from 'express';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { CreateUserInput, UpdateUserInput, GetUsersQuery } from '../schemas/user.schemas';

/**
 * Contrôleur pour obtenir la liste des utilisateurs avec pagination
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page,
      limit,
      search,
      role,
      isActive,
      sortBy,
      sortOrder,
    }: GetUsersQuery = req.query as any;

    // Construction du filtre de recherche
    const filter: any = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) {
        filter.roles = roleDoc._id;
      }
    }

    // Construction du tri
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calcul de la pagination
    const skip = (page - 1) * limit;

    // Requête avec population des rôles
    const users = await User.find(filter)
      .select('-password')
      .populate({
        path: 'roles',
        select: 'name description',
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Comptage total pour la pagination
    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          pages: totalPages,
          total,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour obtenir un utilisateur par ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password')
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
          model: 'Permission',
        },
      });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour créer un nouvel utilisateur
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, roles = [] }: CreateUserInput = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà',
      });
      return;
    }

    // Vérifier que les rôles existent
    if (roles.length > 0) {
      const existingRoles = await Role.find({ _id: { $in: roles } });
      if (existingRoles.length !== roles.length) {
        res.status(400).json({
          success: false,
          message: 'Un ou plusieurs rôles spécifiés n\'existent pas',
        });
        return;
      }
    }

    // Créer l'utilisateur
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      roles: roles.length > 0 ? roles : await getDefaultUserRole(),
      emailVerified: true, // Admin peut créer des utilisateurs pré-vérifiés
    });

    await user.save();

    // Charger l'utilisateur avec ses rôles pour la réponse
    const createdUser = await User.findById(user.id)
      .select('-password')
      .populate({
        path: 'roles',
        select: 'name description',
      });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: createdUser,
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour mettre à jour un utilisateur
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateUserInput = req.body;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
      return;
    }

    // Vérifier les rôles si spécifiés
    if (updateData.roles && updateData.roles.length > 0) {
      const existingRoles = await Role.find({ _id: { $in: updateData.roles } });
      if (existingRoles.length !== updateData.roles.length) {
        res.status(400).json({
          success: false,
          message: 'Un ou plusieurs rôles spécifiés n\'existent pas',
        });
        return;
      }
    }

    // Empêcher la modification de son propre statut actif
    if (updateData.isActive !== undefined && req.user?.id === id) {
      res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas modifier votre propre statut actif',
      });
      return;
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate({
        path: 'roles',
        select: 'name description',
      });

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour supprimer un utilisateur
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Empêcher la suppression de son propre compte
    if (req.user?.id === id) {
      res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte',
      });
      return;
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour activer/désactiver un utilisateur
 */
export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Empêcher la modification de son propre statut
    if (req.user?.id === id) {
      res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas modifier votre propre statut',
      });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    const updatedUser = await User.findById(id)
      .select('-password')
      .populate({
        path: 'roles',
        select: 'name description',
      });

    res.status(200).json({
      success: true,
      message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'} avec succès`,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour assigner des rôles à un utilisateur
 */
export const assignRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { roleIds } = req.body;

    if (!Array.isArray(roleIds)) {
      res.status(400).json({
        success: false,
        message: 'roleIds doit être un tableau',
      });
      return;
    }

    // Vérifier que l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
      return;
    }

    // Vérifier que tous les rôles existent
    const roles = await Role.find({ _id: { $in: roleIds } });
    if (roles.length !== roleIds.length) {
      res.status(400).json({
        success: false,
        message: 'Un ou plusieurs rôles spécifiés n\'existent pas',
      });
      return;
    }

    // Assigner les rôles
    user.roles = roleIds;
    await user.save();

    const updatedUser = await User.findById(id)
      .select('-password')
      .populate({
        path: 'roles',
        select: 'name description',
      });

    res.status(200).json({
      success: true,
      message: 'Rôles assignés avec succès',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Erreur lors de l\'assignation des rôles:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Fonction utilitaire pour obtenir le rôle utilisateur par défaut
 */
async function getDefaultUserRole(): Promise<string[]> {
  const defaultRole = await Role.findOne({ name: 'User' });
  return defaultRole ? [String(defaultRole._id)] : [];
}
