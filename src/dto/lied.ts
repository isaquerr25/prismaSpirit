import { ObjectAccountMetaTrader } from './accountMetaTrader';
import { AccountMetaTraderEnum, InvoicesEnum, Lied } from '@prisma/client';
import { ObjectType, Field, InputType, Int, registerEnumType} from 'type-graphql';


@ObjectType()
export class ObjectLied implements Lied   {
	@Field(() => Int, { nullable: true })
		id!: number;
	@Field(() => String, { nullable: true })
		email!: string;
	@Field(() => String, { nullable: true })
		name!: string;
	@Field(() => String, { nullable: true })
		birth!: Date | null;
	@Field(() => String, { nullable: true })
		originLead!: string | null;
	@Field(() => String, { nullable: true })
		sex!: string | null;
	@Field(() => String, { nullable: true })
		address!: string | null;
	@Field(() => String, { nullable: true })
		cep!: string | null;
	@Field(() => String, { nullable: true })
		salaryYear!: number | null;
	@Field(() => String, { nullable: true })
		city!: string | null;
	@Field(() => String, { nullable: true })
		country!: string | null;
	@Field(() => String, { nullable: true })
		statusLead!: string | null;
	@Field(() => String, { nullable: true })
		phone!: string | null;
	@Field(() => String, { nullable: true })
		maritalStatus!: string | null;
	@Field(() => String, { nullable: true })
		createdAt!: Date;
	@Field(() => String, { nullable: true })
		updatedAt!: Date;
}

@InputType()
export class InputLied {
	@Field(() => String, { nullable: true })
		email!: string;

	@Field(() => String, { nullable: true })
		name!: string;

	@Field(() => String, { nullable: true })
		birth?: Date | null;

	@Field(() => String, { nullable: true })
		originLead?: string | null;

	@Field(() => String, { nullable: true })
		sex?: string | null;

	@Field(() => String, { nullable: true })
		address?: string | null;

	@Field(() => String, { nullable: true })
		cep?: string | null;
		
	@Field(() => String, { nullable: true })
		salaryYear?: number | null;

	@Field(() => String, { nullable: true })
		city?: string | null;

	@Field(() => String, { nullable: true })
		country?: string | null;

	@Field(() => String, { nullable: true })
		statusLead?: string | null;

	@Field(() => String, { nullable: true })
		phone?: string | null;

	@Field(() => String, { nullable: true })
		maritalStatus?: string | null;

	@Field(() => String, { nullable: true })
		createdAt?: Date;
		
	@Field(() => String, { nullable: true })
		updatedAt?: Date;
}
