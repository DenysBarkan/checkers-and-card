import { test, expect } from '@playwright/test';
import { Cards } from '../../lib/cards.cards.ts';

test('Check for blackjack', async ({ page, request }) => {
    const cards = new Cards(request);
    const baseUrl = 'https://deckofcardsapi.com/api/deck';
    
    // Navigate to Deck of Cards
    await page.goto('https://deckofcardsapi.com/');

    // Confirm the site is up
    const title = await page.title();
    expect(title).toBe('Deck of Cards API');

    // Get a new deck
    const response = await request.get(`${baseUrl}/new/`);
    const deckData = await response.json();
    const deckId = deckData.deck_id;

    expect(response.status()).toBe(200);
    expect(deckData.success).toBe(true);

    // Shuffle the deck
    const shuffleResponse = await request.get(`${baseUrl}/${deckId}/shuffle/`);
    const shuffleData = await shuffleResponse.json();

    expect(shuffleResponse.status()).toBe(200);
    expect(shuffleData.success).toBe(true);

    // Deal three cards to each of two players
    const player1Cards = await cards.dealCards(baseUrl, deckId, 3);
    const player2Cards = await cards.dealCards(baseUrl, deckId, 3);

    // Check whether either has blackjack
    const player1HasBlackjack = await cards.hasBlackjack(player1Cards);
    const player2HasBlackjack = await cards.hasBlackjack(player2Cards);

    // If either has, write out which one does
    if (player1HasBlackjack) {
        console.log('Player 1 has blackjack!');
    } else if (player2HasBlackjack) {
        console.log('Player 2 has blackjack!');
    } else {
        console.log('Neither player has blackjack');
    }

    // Moved this functions to the Cards class
    // by path src/lib/cards.cards.ts

    // async function dealCards(deckId, count) {
    //     const response = await request.get(`${baseUrl}/${deckId}/draw/?count=${count}`);
    //     const cardsData = await response.json();
    //     return cardsData.cards;
    // }

    // async function hasBlackjack(cards) {
    //     let values = cards.map(card => card.value);
    //     let twentyOne = values
    //         .map(value => {
    //             if (['JACK', 'QUEEN', 'KING'].includes(value)) {
    //                 return 10;
    //             } else if (value === 'ACE') {
    //                 return 1;
    //             } else {
    //                 return parseInt(value);
    //             }
    //         }).reduce((a, b) => a + b, 0);
    //     if(values.includes('ACE') && twentyOne + 10 === 21) twentyOne += 10;
    //     return twentyOne === 21;
    // }
});
