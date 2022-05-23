import { InputDeleteOrders, InputNewtOrders, InputUpdateOrders, ObjectFilterAccountOrders, ObjectOrders } from './../dto/orders';
import { isUserAuth } from './../middleware/isUserAuth';
import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { InvoicesEnum, PrismaClient, Orders, AccountMetaTraderEnum, AccountMetaTraderTypeEnum, accountTypeEnum, OrdersAccount } from '@prisma/client';
import { GraphState } from '../dto/utils';
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

	@Query(() => [ObjectOrders], { nullable: true })
	async ordersAll() {
		return prisma.orders.findMany({include:{}});
	}

	@Mutation(() => [GraphState])
	async ordersCreate(@Arg('data', () => InputNewtOrders) 
		data: InputNewtOrders,
		@Ctx() ctx: any	
	) {
		
		const progressInfo = [{}];
		if( data.par === undefined || 
			data.direction === undefined || 
			data.ticket === undefined || 
			data.local === undefined || 
			data.type === undefined || 
			data.lote === undefined 
		){

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

			await prisma.orders.create({ data });
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
	
	@Mutation(() => [GraphState])
	async ordersUpdate(@Arg('data', () => InputUpdateOrders) 
		data: InputUpdateOrders,
		@Ctx() ctx: any	
	) {
		
		const progressInfo = [{}];

		try {

			await prisma.orders.update({ where:{id:data.id} ,data });
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


	@Mutation(() => [GraphState])
	async ordersDelete(@Arg('data', () => InputDeleteOrders) 
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

	@Query(() => [ObjectAccountFilterAccount], { nullable: true })
	async ordersFilterAccount( @Arg('data') data: ObjectFilterAccountOrders) {
		
		const completeToSend: { 
				allCurrent: number;
				allCopyCurrent: number;
				missingOrders: { par: any;
					direction: any;
					lote: number;
					local: any;
					idOrigin: any;
				}[];
				id: number;
				name: string;
				password: string;
				server: string;
				balance: number; 
				balanceCredit: number; 
				accountNumber: number; 
				status: AccountMetaTraderEnum; 
				createdAt: Date; 
				updatedAt: Date; 
				finishDate: Date | null; 
				userId: number; 
				typeAccount: AccountMetaTraderTypeEnum; 
				local: string[]; 
				accountType: accountTypeEnum; 
				OrdersAccount: OrdersAccount[]; 
			}[] =[]; 
			
		for(const res of data.local){
			
			const allOrdersOpen =  await prisma.orders.findMany({where:{local:res,status:'OPEN',type:'NORMAL'}});
			
			const idOriginalOrder =  allOrdersOpen.map((index)=>{
				return index.id;
			});

			const allAccounts =  await prisma.accountMetaTrader.findMany({	
				where:{
					local:{ has : res},
				},
				include:{OrdersAccount:true}
			});
			//work all open orders 
			const calculateLostOrdersOpen =  allAccounts.map(async (index)=>{
				

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
			await Promise.all(calculateLostOrdersOpen).then(function(results) {
				completeToSend.push(...results);
			});

			const allOrdersClose =  await prisma.orders.findMany({where:{
				local:res,
				status:'CLOSE',
				type:'NORMAL'},
			include:{OrdersAccount:true}
			});
			
			const orderModify = ...(allOrdersClose.map(({OrdersAccount}) => OrdersAccount));
			console.log(...orderModify);

			
			const calculateLostOrdersClose =  allAccounts.map(async (index)=>{
				map({
					par:groupOriginalOrder[i].par,
					direction:groupOriginalOrder[i].direction,
					lote: Math.trunc(sumOrders),
					local:groupOriginalOrder[i].local,
					idOrigin:groupOriginalOrder[i].id,
					status:groupOriginalOrder[i].status,
					type:groupOriginalOrder[i].type,
					accountMetaTraderId:accountId,
				})

				return{
					...index,
					allCurrent : index.OrdersAccount.length,
					allCopyCurrent : allOrdersClose.length,
					missingOrders: allOrdersClose.filter(orders => orders.);
				};

			});

			await Promise.all(calculateLostOrdersClose).then(function(results) {
				completeToSend.push(...results);
			});

		}

		console.log('--------------------------------------------------------------');
		completeToSend.sort((a, b) => a.accountNumber - (b.accountNumber));

		return completeToSend;
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

const calculateOrders = async (statusOrder:statusOrder,
	groupOriginalOrder:any,accountOrder:any,
	balance:number,
	accountId:number
) =>{
	const result = [];
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate()-1);

	const idOriginalOrder =  accountOrder.map((index: { ordersId: number; })=>{
		return index.ordersId;
	});

	const rangeWorkLot = await loteRangeInfluence(balance,groupOriginalOrder[0].local);
	
	let sumOrders = rangeWorkLot?.minLot ?? 10;

	if(accountOrder.length !=0){

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
				idOrigin:groupOriginalOrder[i].id,
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