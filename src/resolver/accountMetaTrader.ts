import { isUserAuth } from './../middleware/isUserAuth';
import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { GraphState } from '../dto/utils';
import { InputAccountPython, InputChangeAccountMetaTrader, InputDeleteAccountMetaTrader, InputNewAccountMetaTrader, InputStopWorkAccountMetaTrader, ObjectAccountFilterAccount, ObjectAccountMetaTrader } from '../dto/accountMetaTrader';
import { getTokenId } from '../utils';
import { loteRangeInfluence } from './loteAutoCalculate';
import { ObjectFilterAccountOrders } from '../dto/orders';
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

	@Query(() => [ObjectAccountFilterAccount], { nullable: true })
	async ordersFilterAccount( @Arg('data') data: ObjectFilterAccountOrders) {
		
		const completeToSend: any =[]; 
		
		for(const res of data.local){


			const allOrdersOpen =  await prisma.orders.findMany({where:{local:res,status:'OPEN',type:'NORMAL'}});
			if(allOrdersOpen.length != 0){
				
				const idOriginalOrder =  allOrdersOpen.map((index)=>{
					return index.id;
				});
	
				const allAccounts =  await prisma.accountMetaTrader.findMany({	
					where:{
						OR:[
							{status:'WORK'},
							{AND:[{NOT:[{typeAccount:'GUEST'},{status:'ERROR_LOGIN'}]}]},
						],
						local:{ has : res },
						
						finishDate:{gte:new Date()},		
	
					},
					include:{OrdersAccount:{where:{status:'OPEN'}} }
				});	
	
				console.log('data.locssssssssssssal');
				const calculateLostOrdersOpen = allAccounts.map(async (index)=>{
					
	
					return{
						...index,
						allCurrent : index.OrdersAccount.length,
						allCopyCurrent : allOrdersOpen.length,
						missingOrders: await calculateOrders(
							{
								ordersTotal:3,	
								ordersInAccount:index.OrdersAccount.length
							},
							allOrdersOpen,
							index.OrdersAccount,
							(index.balance + index.balanceCredit),
							index.id
						)
					};
	
				});
	
				(completeToSend.push(...(await Promise.all(calculateLostOrdersOpen))));
				
			} 

			console.log('data.local');
			const allOrdersClose =  await prisma.orders.findMany({where:{
				local:res,
				status:'CLOSE',
			},
			include:{
				OrdersAccount:{
					include:{refAccount:true},
					where:{
						NOT:{status:'CLOSE'},
						refAccount:{
							OR:[
								{status:'WORK'},
								{NOT:{typeAccount:'GUEST'}}
							]
						}}
				}
			}
				//include:{OrdersAccount:{include:{refAccount:true},where:{NOT:{status:'CLOSE'}}},},
			

			});
			console.log('allOrdersOpen');
			if(allOrdersClose.length !=0){

				const orderDestruct = (allOrdersClose.filter(({OrdersAccount}) => OrdersAccount.length !== 0));
				
				const calculateLostOrdersClose =  orderDestruct.map( async ({OrdersAccount})=>{
					
					return	OrdersAccount.map((props) =>{ 
						return{
							...props.refAccount,
							missingOrders:[{
								...props,
								status:'CLOSE'}] 
							
						};
					});			
				});
	
				await Promise.all(calculateLostOrdersClose).then(function(results) {
					const consumer = (results.flat());
					completeToSend.push(...consumer);
				});

			}

		}

		completeToSend.sort((a: { id: number; }, b: { id: any; }) => a.id - (b.id));
		
		for(let i = completeToSend.length-1; i >= 0; i-- ) {
			console.log(completeToSend[i].missingOrders.length);
			if(completeToSend[i].missingOrders.length !== 0){

				for(let j = completeToSend.length-1; j >= 0; j-- ) {
					if(completeToSend[i].id === completeToSend[j].id && i != j) {
						completeToSend[j].missingOrders.push(...completeToSend[i].missingOrders);
						completeToSend.splice(i,1);
						break;
					}
				}
			}else{
				console.log('entro');
				completeToSend.splice(i,1);
			}
		}
		
		
		console.log('--------------------------------------------------------------');
		console.log(completeToSend);
		
		return completeToSend;
	}


	@Mutation(() => GraphState, { nullable: true })
	async accountUpdatePython(
		@Arg('data', () => InputAccountPython) data: InputAccountPython
	)
	{

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

}

interface objOrderOriginal{
	par:string
	direction:string
	local:string
	idOrigin:number
}

interface statusOrder{
	ordersTotal:number
	ordersInAccount:number
}
enum styleEnum {
	FIX = 1,
	MULTIPLY_2 = 2,
	MULTIPLY_1_1 = 1.1,
	MULTIPLY_1_2 = 1.2,
	MULTIPLY_1_3 = 1.3,
	MULTIPLY_1_4 = 1.4,
	MULTIPLY_1_5 = 1.5
  }

const calculateOrders = async (
	statusOrder:statusOrder,
	groupOriginalOrder:any,
	accountOrder:any,
	balance:number,
	accountId:number
) =>{
	const result = [];
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate()-1);

	const idOriginalOrder =  accountOrder.map((index: { ordersId: number; })=>{
		return index.ordersId;
	});
	console.log('groupOriginalOrder ----> ', groupOriginalOrder[0]);
	const rangeWorkLot = await loteRangeInfluence(balance,groupOriginalOrder[0].local);
	
	let sumOrders = rangeWorkLot?.minLot ?? 1;
	if(accountOrder.length !=0){
		
		accountOrder.sort((a: { lote: number; }, b: { lote: any; }) => a.lote - (b.lote));
		sumOrders = accountOrder[accountOrder.length-1].lote > sumOrders ? accountOrder[accountOrder.length-1].lote : sumOrders;
		if(rangeWorkLot?.maxLot){
			if((sumOrders * styleEnum[rangeWorkLot.styleMath]) <= rangeWorkLot?.maxLot){
				sumOrders = sumOrders * styleEnum[rangeWorkLot.styleMath];
			}else{
				sumOrders = rangeWorkLot?.maxLot;
			}
		}
	}

	for(let i=0; i<groupOriginalOrder.length; i++ ) {
		
		
		if(!idOriginalOrder.includes(groupOriginalOrder[i].id) && groupOriginalOrder[i].updatedAt > yesterday){
			
			result.push({
				
				par:groupOriginalOrder[i].par,
				direction:groupOriginalOrder[i].direction,
				lote: Math.trunc(sumOrders),
				local:groupOriginalOrder[i].local,
				ordersId:groupOriginalOrder[i].id,
				status:groupOriginalOrder[i].status,
				type:groupOriginalOrder[i].type,
				accountMetaTraderId:accountId,
			});
			if(rangeWorkLot?.maxLot){
				if((sumOrders * styleEnum[rangeWorkLot.styleMath]) <= rangeWorkLot?.maxLot){
					sumOrders = sumOrders * styleEnum[rangeWorkLot.styleMath];
				}else{
					sumOrders = rangeWorkLot?.maxLot;
				}
			}
		}
	}

	return result;

};