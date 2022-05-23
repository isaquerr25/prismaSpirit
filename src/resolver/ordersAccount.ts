import { InputDeleteOrdersAccounts } from './../dto/ordersAccount';
import { InputDeleteOrders, InputNewtOrders, InputUpdateOrders, ObjectOrders } from './../dto/orders';
import { isUserAuth } from './../middleware/isUserAuth';
import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { InvoicesEnum, PrismaClient } from '@prisma/client';
import { GraphState } from '../dto/utils';
import { InputChangeAccountMetaTrader, InputDeleteAccountMetaTrader, InputNewAccountMetaTrader, InputStopWorkAccountMetaTrader, ObjectAccountMetaTrader } from '../dto/accountMetaTrader';
import { getTokenId } from '../utils';
import { InputNewInvoices, ObjectInvoices } from '../dto/invoices';
import { InputNewPlanInvoices, InputUpdatePlanInvoices, ObjectPlanInvoices } from '../dto/planInvoices';
import { isManagerAuth } from '../middleware/isManagerAuth';
import { InputNewtOrdersAccounts, InputUpdateOrdersAccounts, ObjectOrdersAccounts } from '../dto/ordersAccount';
export const prisma = new PrismaClient();


@Resolver()
export class OrdersAccountResolver {

	@UseMiddleware(isManagerAuth)
	@Query(() => [ObjectOrdersAccounts], { nullable: true })
	async ordersAccountAll() {
		return prisma.ordersAccount.findMany({include:{refAccount:true,refOriginalOrder:true}});
	}

	@UseMiddleware(isManagerAuth)
	@Mutation(() => [GraphState])
	async ordersAccountCreate(@Arg('data', () => InputNewtOrdersAccounts) 
		data: InputNewtOrdersAccounts,
		@Ctx() ctx: any	
	) {
		
		const progressInfo = [{}];
		if( data.par === undefined || 
			data.direction === undefined || 
			data.ticket === undefined || 
			data.local === undefined || 
			data.type === undefined || 
			data.accountMetaTraderId === undefined || 
			data.ordersId === undefined || 
			data.lote === undefined 
		){
			if(data.accountMetaTraderId === undefined){
				progressInfo.push({
					field: 'accountMetaTraderId',
					message: 'accountMetaTraderId is empty',
				});
			}
			if(data.ordersId === undefined){
				progressInfo.push({
					field: 'ordersId',
					message: 'ordersId is empty',
				});
			}
			if(data.lote === undefined){
				progressInfo.push({
					field: 'lote',
					message: 'lote is empty',
				});
			}
			if(data.type === undefined){
				progressInfo.push({
					field: 'type',
					message: 'type is empty',
				});
			}
			if(data.local === undefined){
				progressInfo.push({
					field: 'local',
					message: 'local is empty',
				});
			}
			if(data.par === undefined){
				progressInfo.push({
					field: 'par',
					message: 'par is empty',
				});
			}
			if(data.direction === undefined){
				progressInfo.push({
					field: 'direction',
					message: 'direction is empty',
				});
			}
			if(data.ticket === undefined){
				progressInfo.push({
					field: 'ticket',
					message: 'ticket is empty',
				});
			}
			return progressInfo;
		}   

		try {

			await prisma.ordersAccount.create({ data });
			progressInfo.push({
				field: 'create',
				message: 'success',
			});

		} catch(error) {
			console.log('bad :',error);
			progressInfo.push({
				field: 'create',
				message: 'error',
			});

		}
		return progressInfo;
	}
	
	@UseMiddleware(isManagerAuth)
	@Mutation(() => [GraphState])
	async ordersAccountUpdate(@Arg('data', () => InputUpdateOrdersAccounts) 
		data: InputUpdateOrders,
		@Ctx() ctx: any	
	) {
		
		const progressInfo = [{}];

		try {

			await prisma.ordersAccount.update({ where:{id:data.id} ,data });
			progressInfo.push({
				field: 'update',
				message: 'success',
			});

		} catch(error) {
			console.log('bad :',error);
			progressInfo.push({
				field: 'update',
				message: 'error',
			});

		}
		return progressInfo;
	}

	@UseMiddleware(isManagerAuth)
	@Mutation(() => [GraphState])
	async ordersAccountDelete(@Arg('data', () => InputDeleteOrdersAccounts) 
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