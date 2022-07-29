import { InputDeleteOrders, InputNewtOrders, InputUpdateOrders, InputUpdateOrdersSite, ObjectFilterAccountOrders, ObjectOrders } from './../dto/orders';
import { isUserAuth } from '../middleware/isUserAuth';
import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { InvoicesEnum, PrismaClient, Orders, AccountMetaTraderEnum, AccountMetaTraderTypeEnum, accountTypeEnum, OrdersAccount } from '@prisma/client';
import { GraphState, PassToken, SendToken } from '../dto/utils';
import { InputChangeAccountMetaTrader, InputDeleteAccountMetaTrader, InputNewAccountMetaTrader, InputStopWorkAccountMetaTrader, ObjectAccountFilterAccount, ObjectAccountMetaTrader } from '../dto/accountMetaTrader';
import { getTokenId } from '../utils';
import { InputNewInvoices, ObjectInvoices } from '../dto/invoices';
import { InputNewPlanInvoices, InputUpdatePlanInvoices, ObjectPlanInvoices } from '../dto/planInvoices';
import { isManagerAuth } from '../middleware/isManagerAuth';
import { length } from 'class-validator';
import { loteRangeInfluence } from './loteAutoCalculate';
export const prisma = new PrismaClient();


@Resolver()
export class OrdersResolver {

	@UseMiddleware(isManagerAuth)
	@Query(() => [ObjectOrders], { nullable: true })
	async ordersAll() {
		return prisma.orders.findMany({include:{OrdersAccount:true}});
	}

	@UseMiddleware(isManagerAuth)
	@Query(() => ObjectOrders, { nullable: true })
	async ordersFindSingleOrderStaff( 
		@Arg('data') data: PassToken, 
		@Ctx() ctx: any){
		return prisma.orders.findFirst({where:{id:Number(data.token ?? 0)}, include:{OrdersAccount:true}});
	}

	@UseMiddleware(isManagerAuth)
	@Mutation(() => GraphState)
	async ordersUpdateSite(@Arg('data', () => InputUpdateOrdersSite) 
		data: InputUpdateOrders,
		@Ctx() ctx: any	
	) {
		
		const progressInfo = [{}];

		try {

			await prisma.orders.update({ where:{id:data.id} ,data });
			return{
				field: 'update',
				message: 'success',
			};

		} catch(error) {
			console.log('bad :',error);
			return{
				field: 'update',
				message: 'error',
			};

		}
		return progressInfo;
	}

	@UseMiddleware(isManagerAuth)
	@Mutation(() => [GraphState])
	async ordersDeleteSite(@Arg('data', () => InputDeleteOrders) 
		data: InputDeleteOrders,
		@Ctx() ctx: any	
	) {
		
		const progressInfo = [{}];

		try {

			await prisma.orders.delete({ where:{id:data.id} });
			progressInfo.push({
				field: 'delete',
				message: 'success',
			});

		} catch(error) {
			console.log('bad :',error);
			progressInfo.push({
				field: 'delete',
				message: 'error',
			});

		}
		return progressInfo;
	}	
	
}

