import supplierRepository from "../repositories/supplierRepository.js";
import AppError from "../utils/AppError.js";
import type { CreateSupplierInput } from "../validators/supplierValidation.js";
import auditLogService from "./auditLogService.js";

class SupplierService {
  async create(data: CreateSupplierInput, userId: string) {
    if (data.email) {
      const exists = await supplierRepository.findByEmail(data.email);
      if (exists) {
        throw new AppError("Supplier email already exists.", 409);
      }
    }
    const cleanData = {
      ...data,
      email: data.email ?? null,
      phone: data.phone ?? null,
    };
    const supplier = await supplierRepository.create(cleanData);
    await auditLogService.createLog({
      user: {
        connect:{
          id:userId
        },
      },
      action: "CREATE",
      entity: "Supplier",
      entityId: supplier.id,
      details: `Supplier "${supplier.name}" created successfully.`
    });
    return supplier;
  }

  async findAll() {
    return supplierRepository.findAll();
  }

  async findById(id: string) {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new AppError("Supplier not found.", 404);
    }
    return supplier;
  }

  async update(id: string, data: Partial<CreateSupplierInput>, userId: string) {
    await this.findById(id);
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );
    const supplier = await supplierRepository.update(id, cleanData);
    await auditLogService.createLog({
      user: {
        connect: {
          id: userId
        },
      },
      action: "UPDATE",
      entity: "Supplier",
      entityId: supplier.id,
      details: `Supplier "${supplier.name}" updated successfully.`
    });
    return supplier;
  }

  async delete(id: string, userId: string) {
    const supplier = await this.findById(id);
    const deletedSupplier = await supplierRepository.delete(id);
    await auditLogService.createLog({
      user: {
        connect: {
          id: userId
        },
      },
      action: "DELETE",
      entity: "Supplier",
      entityId: supplier.id,
      details: `Supplier "${supplier.name}" deleted successfully.`
    });
    return deletedSupplier;
  }
}
export default new SupplierService();