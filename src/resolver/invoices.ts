import { isUserAuth } from './../middleware/isUserAuth';
import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { accountTypeEnum, InvoicesEnum, PrismaClient, AccountMetaTrader } from '@prisma/client';
import { GraphState, PassToken } from '../dto/utils';
import { InputChangeAccountMetaTrader, InputDeleteAccountMetaTrader, InputNewAccountMetaTrader, InputStopWorkAccountMetaTrader, ObjectAccountMetaTrader } from '../dto/accountMetaTrader';
import { getTokenId } from '../utils';
import { InputNewInvoices, ObjectInvoices } from '../dto/invoices';
export const prisma = new PrismaClient();


@Resolver()
export class InvoicesResolver {

	@UseMiddleware(isUserAuth)
	@Query(() => [ObjectInvoices], { nullable: true })
	async invoiceObjects(@Ctx() ctx: any) {
		console.log(getTokenId(ctx)?.userId);
		const value =  await prisma.invoices.findMany({
			where:{
				metaTraderRefr:{
					userId:getTokenId(ctx)?.userId
				}
			},
			include:{metaTraderRefr:true}
		});

		return value;
	}

	@UseMiddleware(isUserAuth)
	@Query(() => [ObjectInvoices], { nullable: true })
	async invoiceObjectsOpen(@Ctx() ctx: any) {
		console.log(getTokenId(ctx)?.userId);
		const value =  await prisma.invoices.findMany({
			where:{
				status:{notIn:['PAID_OUT']},
				metaTraderRefr:{
					userId:getTokenId(ctx)?.userId
				}
			},
			include:{metaTraderRefr:true}
		});
		return value;
	}

	@UseMiddleware(isUserAuth)
	@Query(() => ObjectInvoices, { nullable: true })
	async invoiceObjectSingleRequest( @Arg('data', () => PassToken) data: PassToken,@Ctx() ctx: any) {
		const value =  await prisma.invoices.findFirst({
			where:{
				id:Number(data.token)
			},
			include:{metaTraderRefr:true}
		});

	
		const { res } = ctx;

		res.cookie('invoice', {token:value?.id} ,{maxAge: 1000 * 60 * 60 * 24,});

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