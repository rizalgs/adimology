import { NextRequest, NextResponse } from 'next/server';
import { fetchMarketDetector, fetchOrderbook, getTopBroker, parseLot, getBrokerSummary } from '@/lib/stockbit';
import { calculateTargets } from '@/lib/calculations';
import { saveStockQuery } from '@/lib/supabase';
import type { StockInput, ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: StockInput = await request.json();
    const { emiten, fromDate, toDate } = body;

    // Validate input
    if (!emiten || !fromDate || !toDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: emiten, fromDate, toDate' },
        { status: 400 }
      );
    }

    // Fetch data from both Stockbit APIs
    const [marketDetectorData, orderbookData] = await Promise.all([
      fetchMarketDetector(emiten, fromDate, toDate),
      fetchOrderbook(emiten),
    ]);

    // Extract top broker data
    const brokerData = getTopBroker(marketDetectorData);

    // Extract broker summary for the new card
    const brokerSummary = getBrokerSummary(marketDetectorData);

    // Extract market data
    // The API might return data wrapped in 'data' property or directly
    // based on previous code handling. We'll try to access .data first.
    // Casting to any to avoid strict type checks on the potential direct structure if types are strict
    const obData = orderbookData.data || (orderbookData as any);
    
    if (!obData.total_bid_offer || obData.close === undefined) {
      console.log('Orderbook API Response Structure:', JSON.stringify(orderbookData, null, 2));
      throw new Error('Invalid Orderbook API response structure');
    }

    // Mencari offer terbesar dan bid terkecil dari orderbook hari ini
    const offerPrices = (obData.offer || []).map((o: { price: string }) => Number(o.price));
    const bidPrices = (obData.bid || []).map((b: { price: string }) => Number(b.price));
    
    const offerTeratas = offerPrices.length > 0 
      ? Math.max(...offerPrices) 
      : Number(obData.high || 0);
    const bidTerbawah = bidPrices.length > 0 ? Math.min(...bidPrices) : 0;

    const marketData = {
      harga: Number(obData.close),
      offerTeratas,
      bidTerbawah,
      totalBid: parseLot(obData.total_bid_offer.bid.lot),
      totalOffer: parseLot(obData.total_bid_offer.offer.lot),
    };



    // Calculate targets
    // Note: totalBid and totalOffer are divided by 100 as per user requirement
    const calculated = calculateTargets(
      brokerData.rataRataBandar,
      brokerData.barangBandar,
      marketData.offerTeratas,
      marketData.bidTerbawah,
      marketData.totalBid / 100,
      marketData.totalOffer / 100,
      marketData.harga
    );


    // Prepare response
    const result: ApiResponse = {
      success: true,
      data: {
        input: { emiten, fromDate, toDate },
        stockbitData: brokerData,
        marketData: {
          ...marketData,
          fraksi: calculated.fraksi,
        },
        calculated: {
          totalPapan: calculated.totalPapan,
          rataRataBidOfer: calculated.rataRataBidOfer,
          a: calculated.a,
          p: calculated.p,
          targetRealistis1: calculated.targetRealistis1,
          targetMax: calculated.targetMax,
        },
        brokerSummary,
      },
    };

    // Save to Supabase (non-blocking)
    saveStockQuery({
      emiten,
      from_date: fromDate,
      to_date: toDate,
      bandar: brokerData.bandar,
      barang_bandar: brokerData.barangBandar,
      rata_rata_bandar: brokerData.rataRataBandar,
      harga: marketData.harga,
      ara: marketData.offerTeratas,
      arb: marketData.bidTerbawah,
      fraksi: calculated.fraksi,
      total_bid: marketData.totalBid,
      total_offer: marketData.totalOffer,
      total_papan: calculated.totalPapan,
      rata_rata_bid_ofer: calculated.rataRataBidOfer,
      a: calculated.a,
      p: calculated.p,
      target_realistis: calculated.targetRealistis1,
      target_max: calculated.targetMax,
    }).catch((err) => console.error('Failed to save to Supabase:', err));

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
