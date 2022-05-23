import { isUserAuth } from './../middleware/isUserAuth';
import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { InvoicesEnum, PrismaClient } from '@prisma/client';
import { GraphState } from '../dto/utils';
import { InputChangeAccountMetaTrader, InputDeleteAccountMetaTrader, InputNewAccountMetaTrader, InputStopWorkAccountMetaTrader, ObjectAccountMetaTrader } from '../dto/accountMetaTrader';
import { getTokenId } from '../utils';
import { InputNewInvoices, ObjectInvoices } from '../dto/invoices';
export const prisma = new PrismaClient();


@Resolver()
export class InvoicesResolver {

	@UseMiddleware(isUserAuth)
	@Query(() => [ObjectInvoices], { nullable: true })
	async invoiceObjects(@Ctx() ctx: any) {
		const value =  await prisma.invoices.findMany({where:{id:getTokenId(ctx)?.userId},include:{metaTraderRefr:true}});

		return value;
	}

	@Mutation(() => [GraphState])
	async invoiceCreate(@Arg('res', () => [InputNewInvoices]) 
		res: [InputNewInvoices],
		@Ctx() ctx: any	
	) {
		const progressInfo = [{}];
		const resultPlanInvoicesPrisma =  await prisma.planInvoices.findFirst({where:{id:res[0].planInvoicesId}});
		for(const account of res){

			const accountMTPrisma =  await prisma.accountMetaTrader.findFirst({where:{accountNumber:account.accountNumber}});
			if(accountMTPrisma){	
				const data = {
					valueDollar: (account.accountNumber ?? 0) * (  Number(process.env.PROFIT_BUSINESS_PERCENTAGE)  /100 ),
					valueReal: ((account.accountNumber ?? 0) * (  Number(process.env.PROFIT_BUSINESS_PERCENTAGE)  /100 ) / resultPlanInvoicesPrisma!.realDollarQuote),
					accountNumber: resultPlanInvoicesPrisma?.accountNumber,
					dollarQuote: resultPlanInvoicesPrisma!.realDollarQuote,
					percentProfit:(account.capital-(account.capital-account.profit))/account.capital,
					percentFess:Number(process.env.PROFIT_BUSINESS_PERCENTAGE),
					status:InvoicesEnum.WAIT_PAYMENT,
					paymenbeginDate: new Date(),
					accountMetaTraderId: accountMTPrisma.id,
					planInvoicesId: resultPlanInvoicesPrisma?.id,
				}; 
				try {
					await prisma.invoices.create({data});

					progressInfo.push({
						field: 'account '+ account.accountNumber,
						message: 'success',
					});

				} catch (error) {
					progressInfo.push({
						field: 'account '+ account.accountNumber,
						message: error,
					});
				}

			}else{
				progressInfo.push({
					field: 'account '+ account.accountNumber,
					message: 'not exist',
				});
			}
		}
		
		return progressInfo;
	}
	
}