import { type APIRequestContext } from 'playwright';

export class Cards {

    constructor(private request: APIRequestContext) { 
        this.request = request;
    };

    async dealCards(baseUrl: string, deckId: string, count: number) {
        const response = await this.request.get(`${baseUrl}/${deckId}/draw/?count=${count}`);
        const cardsData = await response.json();
        return cardsData.cards;
    }

    async hasBlackjack(cards) {
        let values = cards.map(card => card.value);
        let twentyOne = values
            .map(value => {
                if (['JACK', 'QUEEN', 'KING'].includes(value)) {
                    return 10;
                } else if (value === 'ACE') {
                    return 1;
                } else {
                    return parseInt(value);
                }
            }).reduce((a, b) => a + b, 0);
        if(values.includes('ACE') && twentyOne + 10 === 21) twentyOne += 10;
        return twentyOne === 21;
    }

}