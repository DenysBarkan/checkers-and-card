import { test, expect } from '@playwright/test';

test('Check for blackjack', async ({ page, request }) => {
    // Navigate to Deck of Cards
    await page.goto('https://deckofcardsapi.com/');

    // Confirm the site is up
    const title = await page.title();
    expect(title).toBe('Deck of Cards API');

    // Get a new deck
    const response = await request.get('https://deckofcardsapi.com/api/deck/new/');
    const deckData = await response.json();
    const deckId = deckData.deck_id;

    expect(response.status()).toBe(200);
    expect(deckData.success).toBe(true);

    // Shuffle the deck
    const shuffleResponse = await request.get(`https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`);
    const shuffleData = await shuffleResponse.json();

    expect(shuffleResponse.status()).toBe(200);
    expect(shuffleData.success).toBe(true);

    // Deal three cards to each of two players
    const player1Cards = await dealCards(deckId, 3);
    const player2Cards = await dealCards(deckId, 3);

    // console.log('Player 1 cards:', player1Cards);
    // console.log('Player 2 cards:', player2Cards);

    // Check whether either has blackjack
    const player1HasBlackjack = hasBlackjack(player1Cards);
    const player2HasBlackjack = hasBlackjack(player2Cards);

    // If either has, write out which one does
    // Let set the BlackJack as 21
    if (player1HasBlackjack) {
        console.log('Player 1 has blackjack!');
    } else if (player2HasBlackjack) {
        console.log('Player 2 has blackjack!');
    } else {
        console.log('Neither player has blackjack');
    }

    async function dealCards(deckId, count) {
        const response = await request.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`);
        const cardsData = await response.json();
        return cardsData.cards;
    }

    function hasBlackjack(cards) {
        let values = cards.map(card => card.value)
            .map(value => {
                if (['JACK', 'QUEEN', 'KING'].includes(value)) {
                    return 10;
                } else if (value === 'ACE') {
                    return 1;
                } else {
                    return parseInt(value);
                }
            });
        let twentyOne = values.reduce((a, b) => a + b, 0);
        return twentyOne === 21;
    }
});
