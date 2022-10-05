import { isManagerAuth } from '../middleware/isManagerAuth';
import { ObjectAccountFindToUser, InputAccountMetaTraderSingleFind } from '../dto/accountMetaTrader';
import { isUserAuth } from '../middleware/isUserAuth';
import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { InvoicesEnum, PrismaClient } from '@prisma/client';
import { GraphState } from '../dto/utils';
import { InputAccountPython, InputChangeAccountMetaTrader, InputDeleteAccountMetaTrader, InputNewAccountMetaTrader, InputStopWorkAccountMetaTrader, ObjectAccountFilterAccount, ObjectAccountMetaTrader } from '../dto/accountMetaTrader';
import { getTokenId, validateEmail } from '../utils';
import { loteRangeInfluence } from './loteAutoCalculate';
import { ObjectFilterAccountOrders } from '../dto/orders';
import { ObjectAccountMetaTraderStaff } from '../dto/staff';
import axios from 'axios';
import { InputLied } from '../dto/lied';
export const prisma = new PrismaClient();


@Resolver()
export class LiedResolver {


	@Mutation(() => GraphState)
	async liedCreate(@Arg('data', () => InputLied) 
		data: InputLied,
		@Ctx() ctx: any	
	) {
		if(!validateEmail(data.email)){
			return {
				field: 'email not available ',
				message: 'lead Create',
			};
		}
		try {
			
			await prisma.lied.create({ data });

		} catch (error) {
			console.log(error);
		}
		
		return {
			field: 'success',
			message: 'lead Create',
		};
	}
}
