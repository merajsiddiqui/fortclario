import { EntityRepository } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { UserCreateRequestContract } from '../contracts/request/user-create.contract';

/**
 * Repository class for managing User entities.
 */
export class UserRepository extends EntityRepository<User> {

  /**
   * Retrieves all users from the database.
   * @returns {Promise<User[]>} A promise that resolves to an array of User entities.
   */
  async findAllUsers(): Promise<User[]> {
    return this.findAll();
  }

  /**
   * Finds a user by their ID.
   * @param {number} id - The ID of the user to find.
   * @returns {Promise<User | null>} A promise that resolves to the User entity if found, or null if not found.
   */
  async findUserById(id: number): Promise<User | null> {
    return this.findOne({ id });
  }

  /**
   * Creates a new user in the database.
   * @param {UserCreateRequestContract} userData - The data for creating a new user.
   * @returns {Promise<User>} A promise that resolves to the newly created User entity.
   */
  async createUser(userData: UserCreateRequestContract): Promise<User> {
    // Create a new user entity with the provided data and current timestamp
    const user = this.create({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // Persist the new user to the database
    await this.em.persistAndFlush(user);
    return user;
  }

  /**
   * Updates an existing user in the database.
   * @param {number} id - The ID of the user to update.
   * @param {Partial<User>} userData - The partial user data to update.
   * @returns {Promise<User | null>} A promise that resolves to the updated User entity if found, or null if not found.
   */
  async updateUser(id: number, userData: Partial<UserCreateRequestContract>): Promise<User | null> {
    const user = await this.findOne({ id });
    if (!user) return null;
    // Assign the new data to the existing user entity
    this.assign(user, userData);
    // Flush changes to the database
    await this.em.flush();
    return user;
  }

  /**
   * Deletes a user from the database.
   * @param {number} id - The ID of the user to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if the user was deleted, false if the user was not found.
   */
  async deleteUser(id: number): Promise<boolean> {
    const user = await this.findOne({ id });
    if (!user) return false;
    // Remove the user from the database
    await this.em.removeAndFlush(user);
    return true;
  }
}
