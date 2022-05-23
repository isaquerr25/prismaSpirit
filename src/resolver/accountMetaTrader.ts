import { isUserAuth } from './../middleware/isUserAuth';
import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { GraphState } from '../dto/utils';
import { InputChangeAccountMetaTrader, InputDeleteAccountMetaTrader, InputNewAccountMetaTrader, InputStopWorkAccountMetaTrader, ObjectAccountMetaTrader } from '../dto/accountMetaTrader';
import { getTokenId } from '../utils';
export const prisma = new PrismaClient();


@Resolver()
export class AccountMetaTraderResolver {

	@UseMiddleware(isUserAuth)
	@Mutation(() => [GraphState])
	async accountMetaTraderCreate(@Arg('data', () => InputNewAccountMetaTrader) 
		data: InputNewAccountMetaTrader,
		@Ctx() ctx: any	
	) {
		
		const progressInfo = [{}];
		data.userId = getTokenId(ctx)?.userId; 
		

		if (!await prisma.user.findFirst({ where: { id: data.userId } })) {
			progressInfo.push({
				field: 'error',
				message: 'this account not exists',
			});
			return progressInfo;
		}
		if( data.name === undefined || 
			data.name.trim() ==='' ||
			data.server === undefined || 
			data.server.trim() ==='' ||
			data.password === undefined || 
			data.password.trim() ==='' ||
			data.balance === undefined || 
			data.balance < 100000 ||
			data.accountNumber === undefined || 
			data.accountNumber < 1000
		){

			if(data.name === undefined || data.name?.trim() ===''){
				progressInfo.push({
					field: 'name',
					message: 'name is empty',
				});
			}
			if(data.server === undefined || data.server?.trim() ===''){
				progressInfo.push({
					field: 'server',
					message: 'server is empty',
				});
			}
			if(data.password === undefined || data.password?.trim() ===''){
				progressInfo.push({
					field: 'password',
					message: 'password is empty',
				});
			}
			if(data.balance === undefined || data.balance < 100000 ){
				progressInfo.push({
					field: 'Balance',
					message: 'Balance is below the 1000 dollars allowed',
				});
			}
			if(data.accountNumber === undefined || data.accountNumber < 1000 ){
				progressInfo.push({
					field: 'accountNumber',
					message: 'AccountNumber not Valid',
				});
			}
			return progressInfo;
		}   
		try {

			await prisma.accountMetaTrader.create({ data:{
				...data,
				local:'default'
			} });
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

	@UseMiddleware(isUserAuth)
	@Mutation(() => GraphState, { nullable: true })
	async accountMetaTraderUpdate(
		@Arg('data', () => InputChangeAccountMetaTrader) data: InputChangeAccountMetaTrader,
		@Ctx() ctx: any	)
	{
		let newValidateUser = {};

		const currentToken = getTokenId(ctx)?.userId;
		const newUser = await prisma.user.findFirst({
			where: { id: currentToken },
		});
		if (!currentToken || !newUser){
			newValidateUser = {
				field: 'password',
				message: 'Account not exist',
			};
			return newValidateUser;
		}
		if (data.balance !== undefined){
			if(data.balance < 100000){
				return { field: 'balance ', message: 'balance is below the 1000 dollars allowed' };
			}
		}

		try {
			await prisma.accountMetaTrader.update({
				where: { id: data.id },
				data: { ...data },
			});
			return { field: 'success', message: 'change Information' };
		} catch (errors) {
			return { field: 'update', message: errors };
		}
				
		
		return { field: 'update', message: '404' };
	}

	@UseMiddleware(isUserAuth)
	@Query(() => [ObjectAccountMetaTrader], { nullable: true })
	async accountMetaTraderObjects(@Ctx() ctx: any) {
		const value =  await prisma.accountMetaTrader.findMany({where:{id:getTokenId(ctx)?.userId}});
		// NOTE get number all orders in progress
		// NOTE get last invoices
		return value;
	}

	@UseMiddleware(isUserAuth)
	@Mutation(() => GraphState)
	async accountMetaTraderDelete(
	@Arg('data', () => InputDeleteAccountMetaTrader) data: InputDeleteAccountMetaTrader,
	@Ctx() ctx: any	) 
	{
		// NOTE Just delete if not have problem in invoices
		try {
			
			await prisma.accountMetaTrader.delete({where:{id:data.id}});
			return { field: 'delete', message: 'success' };
		} catch (error) {
			
			return { field: 'delete', message: error };
		}
	}

	@UseMiddleware(isUserAuth)
	@Mutation(() => GraphState)
	async accountMetaTraderStopWork(
	@Arg('data', () => InputStopWorkAccountMetaTrader) data: InputStopWorkAccountMetaTrader,
	@Ctx() ctx: any	) 
	{
		// NOTE Just delete if not have problem in invoices
		try {
			
			await prisma.accountMetaTrader.update({
				where: { id: data.id },
				data: {status : data.status},
			});
			return { field: 'change', message: 'success' };
		} catch (error) {
			
			return { field: 'change', message: error };
		}
	}

}