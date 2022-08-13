import { ObjectPlanInvoicesComplete } from './planInvoices';
import { PlanToAccount } from '@prisma/client';
import { Field, ObjectType } from 'type-graphql';
import { ObjectAccountFilterAccount } from './accountMetaTrader';

@ObjectType()
export class ObjectPlanToAccount implements PlanToAccount {
	@Field(() => Number, { nullable: true }) planInvoicesId!: number;
	@Field(() => Number, { nullable: true }) accountMetaTraderId!: number;
    @Field(() => Date, { nullable: true }) createdAt!: Date;
    @Field(() => ObjectPlanInvoicesComplete, { nullable: true }) PlanInvoices!: ObjectPlanInvoicesComplete;
    @Field(() => ObjectAccountFilterAccount, { nullable: true }) AccountMetaTrader!: ObjectAccountFilterAccount;
    
}