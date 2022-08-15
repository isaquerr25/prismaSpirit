import { InputObjectInvoicesStaff } from './../dto/invoices';
import { isManagerAuth } from './../middleware/isManagerAuth';
import { isUserAuth } from '../middleware/isUserAuth';
import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { accountTypeEnum, InvoicesEnum, PrismaClient, AccountMetaTrader, PlanToAccount } from '@prisma/client';
import { GraphState, PassToken } from '../dto/utils';
import { InputChangeAccountMetaTrader, InputDeleteAccountMetaTrader, InputNewAccountMetaTrader, InputStopWorkAccountMetaTrader, ObjectAccountMetaTrader } from '../dto/accountMetaTrader';
import { getTokenId } from '../utils';
import { InputNewInvoices, ObjectInvoices } from '../dto/invoices';
export const prisma = new PrismaClient();


@Resolver()
export class InvoicesResolver {

	@UseMiddleware(isManagerAuth)
	@Query(() => [ObjectInvoices], { nullable: true })
	async invoiceObjectsStaff() {
		const value =  await prisma.invoices.findMany({include:{metaTraderRefr:true,paymentProof:true,PlanInvoices:true}});
		console.log(value);
		return value;
	}

	@UseMiddleware(isManagerAuth)
	@Mutation(() => GraphState, { nullable: true })
	async invoiceObjectsStaffUpdate( @Arg('data', () => InputObjectInvoicesStaff) data: InputObjectInvoicesStaff) {
		try{

			const value =  await prisma.invoices.update({
				where: { id: data.id ?? 0 },
				data: {...data}
			});
			console.log('invoiceObjectsStaffUpdate => ',value);
			return {
				field: 'success',
				message: 'alter invoice with success',
			};
		}
		catch(error){
			console.log('invoiceObjectsStaffUpdate => ', error);
			return {
				field: 'error',
				message: 'problem in alter this invoice',
			};
		}
	
	}

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

	@UseMiddleware(isManagerAuth)
	@Query(() => ObjectInvoices, { nullable: true })
	async invoiceObjectSingleRequestStaff( @Arg('data', () => PassToken) data: PassToken,@Ctx() ctx: any) {
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


	@UseMiddleware(isUserAuth)
	@Mutation(() => [GraphState])
	async invoiceCreate(@Arg('res', () => [InputNewInvoices]) 
		res: [InputNewInvoices],
		@Ctx() ctx: any	
	) {
		const progressInfo = [{}];
		for(const account of res){
			const resultPlanInvoicesPrisma =  await prisma.planInvoices.findFirst({where:{id:account.planInvoicesId}});
			const accountMTPrisma =  await prisma.accountMetaTrader.findFirst({where:{accountNumber:account.accountNumber}});
			console.log('percentProfit=> ',account.capital);
			console.log('percentProfit=> ',(account.capital-(account.capital-account.profit))/account.capital);
			if(accountMTPrisma){	
				const data = {
					valueDollar: (account.profit ?? 0) * (  Number(process.env.PROFIT_BUSINESS_PERCENTAGE)  /100 ),
					valueReal: ((account.profit ?? 0) * (  Number(process.env.PROFIT_BUSINESS_PERCENTAGE)  /100 ) / resultPlanInvoicesPrisma!.realDollarQuote),
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
					
					await prisma.planInvoices.update({
						where:{
							id:account.idPlanToAccount
						},
						data:{
							status:'COMPLETE'
						}
					});

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
	
	@UseMiddleware(isManagerAuth)
	@Mutation(() => GraphState)
	async invoiceCreateStaff(@Arg('res', () => InputNewInvoices) 
		res: InputNewInvoices,
		@Ctx() ctx: any	
	) {
		console.log('1> ' );
		const toPlan = await prisma.planToAccount.findUnique({where:{id:res.idPlanToAccount}});
		if (!toPlan){
			return{
				field: 'error',
				message: 'do not have this plan',
			};
		}
		if( toPlan.status == 'COMPLETE'  ){
			return{
				field: 'error',
				message: 'this plan alright complete',
			};
		}
		let resultPlanInvoicesPrisma:any = null;
		try {

			resultPlanInvoicesPrisma =  await prisma.planInvoices.findFirst({where:{id:res.planInvoicesId}});
			
		} catch (error) {
			console.log('dasdasd => ',error );
			resultPlanInvoicesPrisma =  null;
		}
		console.log('2> ' );

		const accountMTPrisma =  await prisma.accountMetaTrader.findFirst({where:{accountNumber:Number(res.accountNumber)}});
		console.log('3> ' );
		console.log(resultPlanInvoicesPrisma != null ? resultPlanInvoicesPrisma!.realDollarQuote : 'asds');
		console.log('5> ' );
		console.log('percentProfit=> ',res.capital);
		console.log('percentProfit=> ',Math.ceil(( (res.capital-(res.capital-res.profit))/res.capital)*100*100));
			
		if(accountMTPrisma){	
			const data = {
				valueDollar: (res.profit ?? 0) * (  Number(process.env.PROFIT_BUSINESS_PERCENTAGE)  /100 )*100,
				valueReal: Math.ceil((res.profit ?? 0) * (  Number(process.env.PROFIT_BUSINESS_PERCENTAGE)  /100 ) * (resultPlanInvoicesPrisma?.realDollarQuote ? resultPlanInvoicesPrisma.realDollarQuote : 520)),
				dollarQuote: (resultPlanInvoicesPrisma?.realDollarQuote ? resultPlanInvoicesPrisma.realDollarQuote : 520),
				percentProfit:Math.ceil(( (res.capital-(res.capital-res.profit))/res.capital)*100*100),
				percentFess:Number(process.env.PROFIT_BUSINESS_PERCENTAGE),
				status:InvoicesEnum.WAIT_PAYMENT,
				paymenbeginDate: new Date(),
				accountMetaTraderId: accountMTPrisma.id,
				planInvoicesId: resultPlanInvoicesPrisma?.id,
			}; 
			try {
				await prisma.invoices.create({data});
				
				await prisma.planToAccount.update({
					where:{
						id:res.idPlanToAccount
					},
					data:{
						status:'COMPLETE'
					}
				});

				return{
					field: 'success',
					message: 'account '+ res.accountNumber,
				};

			} catch (error) {
				console.log('catch => ',error );
				return{
					field: 'error',
					message: 'account '+ res.accountNumber,
				};
			}

		}else{
			return{
				field: 'not exist',
				message: 'account '+ res.accountNumber,
			};
		}
		console.log('4> ' );
		
		return null;
	}

}