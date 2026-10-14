import supplierRepository from "../repositories/supplierRepository.js";
import AppError from "../utils/AppError.js";
import type { CreateSupplierInput } from "../validators/supplierValidation.js";
import auditLogService from "./auditLogService.js";
import activityNotificationService from "./activityNotificationService.js";

type SupplierActivityType =
  | "SUPPLIER_CREATED"
  | "SUPPLIER_UPDATED"
  | "SUPPLIER_DELETED";

class SupplierService {
  private async notifySupplierActivity(
    type: SupplierActivityType,
    supplierName: string,
  ) {
    const titles = {
      SUPPLIER_CREATED: "New Supplier Added",
      SUPPLIER_UPDATED: "Supplier Updated",
      SUPPLIER_DELETED: "Supplier Deleted",
    };

    const messages = {
      SUPPLIER_CREATED: `Supplier "${supplierName}" was added.`,
      SUPPLIER_UPDATED: `Supplier "${supplierName}" was updated.`,
      SUPPLIER_DELETED: `Supplier "${supplierName}" was deleted.`,
    };

    const notifications =
      await activityNotificationService.createActivityNotifications({
        type,
        title: titles[type],
        message: messages[type],
        recipientRoles: ["ADMIN", "MANAGER"],
      });

    activityNotificationService.emitNotifications(notifications);
  }

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
        connect: {
          id: userId,
        },
      },
      action: "CREATE",
      entity: "Supplier",
      entityId: supplier.id,
      details: `Supplier "${supplier.name}" created successfully.`,
    });

    await this.notifySupplierActivity("SUPPLIER_CREATED", supplier.name);

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
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    const supplier = await supplierRepository.update(id, cleanData);

    await auditLogService.createLog({
      user: {
        connect: {
          id: userId,
        },
      },
      action: "UPDATE",
      entity: "Supplier",
      entityId: supplier.id,
      details: `Supplier "${supplier.name}" updated successfully.`,
    });

    await this.notifySupplierActivity("SUPPLIER_UPDATED", supplier.name);

    return supplier;
  }

  async delete(id: string, userId: string) {
    const supplier = await this.findById(id);
    const deletedSupplier = await supplierRepository.delete(id);

    await auditLogService.createLog({
      user: {
        connect: {
          id: userId,
        },
      },
      action: "DELETE",
      entity: "Supplier",
      entityId: supplier.id,
      details: `Supplier "${supplier.name}" deleted successfully.`,
    });

    await this.notifySupplierActivity("SUPPLIER_DELETED", supplier.name);

    return deletedSupplier;
  }
}

export default new SupplierService();
