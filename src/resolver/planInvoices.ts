import { isUserAuth } from '../middleware/isUserAuth';
import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { InvoicesEnum, PrismaClient } from '@prisma/client';
import { GraphState } from '../dto/utils';
import { 
	InputChangeAccountMetaTrader, 
	InputDeleteAccountMetaTrader, 
	InputNewAccountMetaTrader, InputStopWorkAccountMetaTrader, ObjectAccountMetaTrader } from '../dto/accountMetaTrader';
import { getTokenId } from '../utils';
import { InputNewInvoices, ObjectInvoices } from '../dto/invoices';
import { InputNewPlanInvoices, InputUpdatePlanInvoices, ObjectPlanInvoices } from '../dto/planInvoices';
import { isManagerAuth } from '../middleware/isManagerAuth';
import { ObjectFilterAccountOrders } from '../dto/orders';
export const prisma = new PrismaClient();


@Resolver()
export class PlanInvoicesResolver {

	@UseMiddleware(isManagerAuth)
	@Mutation(() => [GraphState])
	async planInvoicesCreate(@Arg('data', () => InputNewPlanInvoices) 
		data: InputNewPlanInvoices,
		@Ctx() ctx: any	
	) {
		
		const progressInfo = [{}];
		if( data.beginDate === undefined || 
			data.finishDate === undefined || 
			data.realDollarQuote === undefined 
		){

			if(data.beginDate === undefined){
				progressInfo.push({
					field: 'beginDate',
					message: 'beginDate is empty',
				});
			}
			if(data.finishDate === undefined){
				progressInfo.push({
					field: 'finishDate',
					message: 'finishDate is empty',
				});
			}
			if(data.realDollarQuote === undefined){
				progressInfo.push({
					field: 'realDollarQuote',
					message: 'realDollarQuote is empty',
				});
			}
			return progressInfo;
		}   
		try {

			await prisma.planInvoices.create({ data });
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
	@Query(() => [ObjectPlanInvoices], { nullable: true })
	async planInvoicesAll() {
		return prisma.planInvoices.findMany();
	}


	@UseMiddleware(isManagerAuth)
	@Mutation(() => [GraphState])
	async planInvoicesUpdate(@Arg('data', () => InputUpdatePlanInvoices) 
		data: InputUpdatePlanInvoices,
		@Ctx() ctx: any	
	) {
		
		const progressInfo = [{}];

		try {

			await prisma.planInvoices.update({where:{id:data.id},  data });
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

	
}