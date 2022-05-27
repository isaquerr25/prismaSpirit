import { AccountMetaTraderEnum } from '@prisma/client';
import { ObjectType, Field, InputType, Int, registerEnumType} from 'type-graphql';

@ObjectType()
export class ObjectAccountMetaTrader  {
	@Field(() => Int, { nullable: true })
		id?: number;
	@Field(() => String, { nullable: true })
		name?: string;
	@Field(() => String, { nullable: true })
		server?: string;
	@Field(() => Int, { nullable: true })
		balance?: number;
	@Field(() => Int, { nullable: true })
		balanceCredit?: number;
	@Field(() => Int, { nullable: true })
		accountNumber?: number;
	@Field(() => String, { nullable: true })
		status?: string;
	@Field(() => Date, { nullable: true })
		finishDate?: Date;
}



@ObjectType()
export class ObjectAccountFilterShort  {
	@Field(() => [ObjectAccountFilterShort], { nullable: true })
		id?: ObjectAccountFilterShort[];
}


@ObjectType()
export class ObjectAccountFilterAccount  {
	@Field(() => Int, { nullable: true })
		id?: number;
	@Field(() => Date, { nullable: true })
		finishDate?: Date;
	@Field(() => String, { nullable: true })
		name?: string;
	@Field(() => String, { nullable: true })
		password?: string;
	@Field(() => String, { nullable: true })
		server?: string;
	@Field(() => Int, { nullable: true })
		balance?: number;
	@Field(() => Int, { nullable: true })
		balanceCredit?: number;
	@Field(() => Int, { nullable: true })
		accountNumber?: number;
	@Field(() => String, { nullable: true })
		status?: string;
	@Field(() => String, { nullable: true })
		typeAccount?: string;
	@Field(() => Int, { nullable: true })
		allCurrent?: number;
	@Field(() => Int, { nullable: true })
		allCopyCurrent?: number;
	@Field(() => [String], { nullable: true })
		local?: string[];
	@Field(() => [ObjectGroupSimpleOrder], { nullable: true })
		missingOrders?: ObjectGroupSimpleOrder[] | null;
}

@ObjectType()
export class ObjectGroupSimpleOrder  {

	@Field(() => Int, { nullable: true })
		ordersId?: number;
	@Field(() => Int, { nullable: true })
		id?: number;
	@Field(() => Int, { nullable: true })
		ticket?: number;
	@Field(() => String, { nullable: true })
		par?: string;
	@Field(() => String, { nullable: true })
		direction?: string;
	@Field(() => Int, { nullable: true })
		lote?: number;
	@Field(() => String, { nullable: true })
		local?: string;
	
	@Field(() => String, { nullable: true })
		type?: string;
	@Field(() => Int, { nullable: true })
		accountMetaTraderId?: number;	
	
		
}


registerEnumType(AccountMetaTraderEnum, {
	name: 'AccountMetaTraderEnum',
});


@InputType()
export class InputNewAccountMetaTrader {
	@Field(() => String)
		name!: string;
	@Field(() => String)
		password!: string;
	@Field(() => String)
		server!: string;
	@Field(() => Int)
		balance!: number;
	@Field(() => Int)
		balanceCredit!: number;
	@Field(() => Int)
		accountNumber!: number;
	@Field(() => Int, { nullable: true })
		userId!: number;
}

@InputType()
export class InputChangeAccountMetaTrader {
	@Field(() => Int)
		id!: number;
	@Field(() => String,{ nullable: true })
		name?: string;
	@Field(() => String,{ nullable: true })
		password?: string;
	@Field(() => Int,{ nullable: true })
		balance?: number;
	@Field(() => Int,{ nullable: true })
		balanceCredit?: number;
}



@InputType()
export class InputStopWorkAccountMetaTrader {
	@Field(() => Int)
		id?: number;
	@Field(() => AccountMetaTraderEnum)
		status!: AccountMetaTraderEnum;
}

@InputType()
export class InputDeleteAccountMetaTrader {
	@Field(() => Int)
		id?: number;
}