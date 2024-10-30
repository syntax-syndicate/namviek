import { FieldRepository } from "@shared/models";
import { FieldCreate, FieldFactoryBase } from "./type";
import { Field } from "@prisma/client";

export class FieldSelectStrategy implements FieldFactoryBase {
  fieldRepo: FieldRepository
  constructor() {
    this.fieldRepo = new FieldRepository()
  }
  async create(data: FieldCreate): Promise<Field> {
    console.log('create select')
    try {
      const result = await this.fieldRepo.create({ ...{ data: {} }, ...data })
      return result
    } catch (error) {
      console.log(error)
      throw new Error('Create text field error')
    }
  }
}

