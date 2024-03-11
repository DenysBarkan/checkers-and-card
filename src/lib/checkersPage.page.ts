import { type Page, type Locator } from 'playwright';

export class CheckersPage {
    constructor(private page: Page) { }

    // Elements
    board = this.page.locator('#board');
    message = this.page.locator('#message');
    msgMakeMove = this.page.locator('#message').getByText('Make a move');
    msgWait = this.page.locator('#message').getByText('Please wait.');

    arraySpaces = this.page.locator('#board img');
    arrayPieces = (dep: string) => this.page.locator(`#board img[src="${dep}1.gif"]`);

    spaceByName = (space: string) => this.board.locator(`img[name="${space}"]`);

    restart = this.page.locator(`.footnote`).getByText('Restart');
    
    // Methods
    async navigate() {
        await this.page.goto('https://www.gamesforthebrain.com/game/checkers/');
    }
}
