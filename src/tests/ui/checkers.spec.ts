import { test, expect } from '@playwright/test';
import { CheckersPage } from '../../lib/checkersPage.page';

test('Checkers Test', async ({ page }) => {

    /**
     * In the Checkers game are some response issues. 
     * When the movements are fast the incorrect message is shown.
     * Tyred to slowdown the whole test, but the issue still happened.
     * Added daley to clicking the pieces.
     */

    test.slow();
    const checkersPage = new CheckersPage(page);

    // Navigate to the Checkers page
    await checkersPage.navigate();

    // Confirm that the site is up
    await expect(checkersPage.board).toBeVisible();
    await expect(checkersPage.message).toHaveText('Select an orange piece to move.');

    expect(await checkersPage.arrayPieces('you').count()).toBe(12);
    expect(await checkersPage.arrayPieces('me').count()).toBe(12);

    // Take the position of my pieces on the board to compare after restarting the game
    let startPosition = await Promise.all((await checkersPage.arrayPieces('you').all()).map(async (piece) => await piece.getAttribute('name')));

    // Make five legal moves as orange 
    await makeMove('space62', 'space73');
    await makeMove('space42', 'space53');
    await makeMove('space73', 'space64');
    // Include taking a blue piece
    expect(await spaceIncludes('space62', 'me')).toBe(true);    
    await makeMove('space51', 'space73');
    expect(await spaceIncludes('space62', 'me')).toBe(false);    
    await makeMove('space22', 'space13');

    // Restart the game after five moves and confirm that the restarting had been successful
    await checkersPage.restart.click();
    await expect(checkersPage.board).toBeVisible();
    await expect(checkersPage.message).toHaveText('Select an orange piece to move.');

    let restartPosition = await Promise.all((await checkersPage.arrayPieces('you').all()).map(async (piece) => await piece.getAttribute('name')));
    await expect(restartPosition).toEqual(startPosition);

    async function makeMove(from: string, to: string) {
        await checkersPage.spaceByName(from).click({ delay: 2000 });
        await checkersPage.spaceByName(to).click({ delay: 2000 });
        await checkersPage.msgMakeMove.waitFor( { state: 'visible' });
    }

    async function spaceIncludes(space: string, dep: string){
        let spacePiece = await checkersPage.spaceByName(space).getAttribute('src');
        return spacePiece?.includes(dep);
    }
});
