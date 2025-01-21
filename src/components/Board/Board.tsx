import { deepCopy } from "deep-copy-ts";
import { nanoid } from "nanoid";
import * as React from "react";
import { BOARD_SIZE, COLS, MAX_BLOCKS, NULL_COUNT, ROWS } from "../../config";
import { BlockType } from "../../enums";
import {
  type Block,
  type BlockOptions,
  type Blocks,
  type CellT,
} from "../../types";
import { clamp, generateColor, shuffleArray } from "../../utils";
import { Cell } from "./components";
import classes from "./styles.module.css";

const Board = () => {
  const initiateBoard = React.useMemo(() => {
    const initiatedCells: CellT[][] = [];
    const initiatedBlocks: Blocks = {};
    const cellQueue: CellT[] = [];

    for (let row = 0; row < ROWS; row++) {
      const rowTemp: CellT[] = [];

      for (let col = 0; col < COLS; col++) {
        const cell: CellT = { row, col };

        rowTemp.push(cell);
      }

      initiatedCells.push(rowTemp);
    }

    // finding the center cell:
    const centerRow = Math.floor(ROWS / 2);
    const centerCol = Math.floor(COLS / 2);

    const startBlockId = nanoid();

    const startBlock: Block = {
      id: startBlockId,
      type: BlockType.START,
      // dimension: Dimension["1x1"],
      filledCells: [{ row: centerRow, col: centerCol }],
      color: "green",
    };

    initiatedCells[centerRow]![centerCol]!.blockId = startBlockId;
    initiatedBlocks[startBlockId] = startBlock;

    cellQueue.push(initiatedCells[centerRow - 1]![centerCol]!);
    cellQueue.push(initiatedCells[centerRow + 1]![centerCol]!);
    cellQueue.push(initiatedCells[centerRow]![centerCol - 1]!);
    cellQueue.push(initiatedCells[centerRow]![centerCol + 1]!);

    return { initiatedCells, initiatedBlocks, cellQueue };
  }, []);

  const [cellQueue, setCellQueue] = React.useState(initiateBoard.cellQueue);
  const [cells, setCells] = React.useState(initiateBoard.initiatedCells);
  const [blocks, setBlocks] = React.useState(initiateBoard.initiatedBlocks);

  const blockCount = Object.keys(blocks).length;

  const getNeighbors = React.useCallback(
    (cell: CellT, cells: CellT[][], connectedOnly: boolean = true) => {
      const { col: mainCol, row: mainRow } = cell;

      const startCol = clamp(mainCol - 1, 0, COLS - 1);
      const startRow = clamp(mainRow - 1, 0, ROWS - 1);
      const endCol = clamp(mainCol + 1, 0, COLS - 1);
      const endRow = clamp(mainRow + 1, 0, ROWS - 1);

      const neighbors: CellT[] = [];

      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const neighborCell: CellT = cells[row]![col]!;

          if (neighborCell.blockId) continue;
          if (col === mainCol && row === mainRow) continue;

          if (connectedOnly) {
            if (
              (row === mainRow &&
                (col === mainCol - 1 || col === mainCol + 1)) ||
              (col === mainCol && (row === mainRow - 1 || row === mainRow + 1))
            ) {
              neighbors.push(neighborCell);
              continue;
            }
          } else {
            neighbors.push(neighborCell);
          }
        }
      }

      return neighbors;
    },
    [],
  );

  const getBlockOptions = React.useCallback(
    (centerCell: CellT, neighbors: CellT[]) => {
      const allOptions: CellT[][] = [[centerCell]];
      const orderedOptions: BlockOptions = {
        "1x1": [],
        "1x2": [],
        "2x1": [],
        "2x2": [],
      };

      // === === LABEL NEIGHBORS === ===

      const leftCell = neighbors.find(
        cell => cell.col === centerCell.col - 1 && cell.row === centerCell.row,
      );

      const rightCell = neighbors.find(
        cell => cell.col === centerCell.col + 1 && cell.row === centerCell.row,
      );

      const topCell = neighbors.find(
        cell => cell.col === centerCell.col && cell.row === centerCell.row - 1,
      );

      const bottomCell = neighbors.find(
        cell => cell.col === centerCell.col && cell.row === centerCell.row + 1,
      );

      const topRightCell = neighbors.find(
        cell =>
          cell.col === centerCell.col + 1 && cell.row === centerCell.row - 1,
      );

      const topLeftCell = neighbors.find(
        cell =>
          cell.col === centerCell.col - 1 && cell.row === centerCell.row - 1,
      );

      const bottomRightCell = neighbors.find(
        cell =>
          cell.col === centerCell.col + 1 && cell.row === centerCell.row + 1,
      );

      const bottomLeftCell = neighbors.find(
        cell =>
          cell.col === centerCell.col - 1 && cell.row === centerCell.row + 1,
      );

      // === === 1x1 === ===

      if (!centerCell.blockId) {
        const option: CellT[] = [centerCell];
        orderedOptions["1x1"].push(option);
        allOptions.push(option);
      }

      // === === 1x2 === ===

      if (leftCell && !leftCell.blockId) {
        const option: CellT[] = [leftCell, centerCell];
        orderedOptions["1x2"].push(option);
        allOptions.push(option);
      }

      if (rightCell && !rightCell.blockId) {
        const option: CellT[] = [centerCell, rightCell];
        orderedOptions["1x2"].push(option);
        allOptions.push(option);
      }

      // === === 2x1 === ===

      if (topCell && !topCell.blockId) {
        const option: CellT[] = [topCell, centerCell];
        orderedOptions["2x1"].push(option);
        allOptions.push(option);
      }

      if (bottomCell && !bottomCell.blockId) {
        const option: CellT[] = [centerCell, bottomCell];
        orderedOptions["2x1"].push(option);
        allOptions.push(option);
      }

      // === === 2x2 === ===

      if (
        topCell &&
        !topCell.blockId &&
        topLeftCell &&
        !topLeftCell.blockId &&
        leftCell &&
        !leftCell.blockId
      ) {
        const option: CellT[] = [topLeftCell, topCell, leftCell, centerCell];
        orderedOptions["2x2"].push(option);
        allOptions.push(option);
      }

      if (
        topCell &&
        !topCell.blockId &&
        topRightCell &&
        !topRightCell.blockId &&
        rightCell &&
        !rightCell.blockId
      ) {
        const option: CellT[] = [topCell, topRightCell, centerCell, rightCell];
        orderedOptions["2x2"].push(option);
        allOptions.push(option);
      }

      if (
        bottomCell &&
        !bottomCell.blockId &&
        bottomLeftCell &&
        !bottomLeftCell.blockId &&
        leftCell &&
        !leftCell.blockId
      ) {
        const option: CellT[] = [
          leftCell,
          centerCell,
          bottomLeftCell,
          bottomCell,
        ];
        orderedOptions["2x2"].push(option);
        allOptions.push(option);
      }

      if (
        bottomCell &&
        !bottomCell.blockId &&
        bottomRightCell &&
        !bottomRightCell.blockId &&
        rightCell &&
        !rightCell.blockId
      ) {
        const option: CellT[] = [
          centerCell,
          rightCell,
          bottomCell,
          bottomRightCell,
        ];
        orderedOptions["2x2"].push(option);
        allOptions.push(option);
      }

      return { orderedOptions, allOptions };
    },
    [],
  );

  const processCellQueue = React.useCallback(
    (
      newCells: CellT[][] = deepCopy(cells),
      newBlocks: Blocks = deepCopy(blocks),
      newCellQueue: CellT[] = deepCopy(cellQueue),
    ) => {
      if (blockCount > MAX_BLOCKS || newCellQueue.length === 0) {
        return { newCells, newBlocks, newCellQueue };
      }

      if (blockCount === MAX_BLOCKS) {
        const poppedCell = newCellQueue.pop();

        if (!poppedCell) return { newCells, newBlocks, newCellQueue };

        const { row, col } = poppedCell;

        const newBlockId = nanoid();
        const newBlock: Block = {
          id: newBlockId,
          type: BlockType.END,
          filledCells: [poppedCell],
          color: "red",
        };

        newCells[row]![col]!.blockId = newBlockId;

        newBlocks[newBlockId] = newBlock;
      }

      const poppedCell = newCellQueue.shift()!;

      if (poppedCell.blockId) return { newCells, newBlocks, newCellQueue };

      const neighbors = getNeighbors(poppedCell, newCells, false);
      const { allOptions, orderedOptions: _ } = getBlockOptions(
        poppedCell,
        neighbors,
      );

      // add null to options and shuffle it (for random picking).
      const nullArray: null[] = new Array(NULL_COUNT).fill(null);
      const shuffledOptions = shuffleArray([...allOptions, ...nullArray]);
      const randomCells = shuffledOptions[0];

      if (!randomCells) return { newCells, newBlocks, newCellQueue };

      const newBlockId = nanoid();
      const newBlock: Block = {
        id: newBlockId,
        type: BlockType.EMPTY,
        filledCells: randomCells,
        color: generateColor(),
      };

      // remove cellqueue cells while filling them:
      newCellQueue = newCellQueue.filter(cell => {
        const isInRandomCells = randomCells.some(
          rngCell => rngCell.col === cell.col && rngCell.row === cell.row,
        );

        return !isInRandomCells;
      });

      randomCells.forEach(cell => {
        const { row, col } = cell;

        newCells[row]![col]!.blockId = newBlockId;
      });

      const allRandomCellNeighbors: CellT[] = [];

      randomCells.forEach(cell => {
        const randomCellNeighbors = getNeighbors(cell, newCells).filter(
          neighbor => {
            const { col, row } = neighbor;

            const isInRandomCells = randomCells.some(
              rngCell => rngCell.col === col && rngCell.row === row,
            );

            const isInRandomCellNeighbors = allRandomCellNeighbors.some(
              rngCellNeighbor =>
                rngCellNeighbor.col === col && rngCellNeighbor.row === row,
            );

            const isInQueue = newCellQueue.some(
              queuedCell => queuedCell.col === col && queuedCell.row === row,
            );

            return !isInRandomCells && !isInRandomCellNeighbors && !isInQueue;
          },
        );

        allRandomCellNeighbors.push(...randomCellNeighbors);
      });

      newCellQueue.push(...allRandomCellNeighbors);
      newBlocks[newBlockId] = newBlock;

      // return processCellQueue(newCells, newBlocks, newCellQueue);
      return { newCells, newBlocks, newCellQueue };
    },
    [blockCount, blocks, cellQueue, cells, getBlockOptions, getNeighbors],
  );

  const updateCells = React.useCallback(() => {
    if (blockCount > MAX_BLOCKS || cellQueue.length === 0) return;

    const { newBlocks, newCells, newCellQueue } = processCellQueue();

    setCells(newCells);
    setBlocks(newBlocks);
    setCellQueue(newCellQueue);
  }, [blockCount, cellQueue, processCellQueue]);

  // === === === KEY INPUT (debugging) === === === //

  // const handleSpacePress = (e: KeyboardEvent) => {
  //   const key = e.key;

  //   if (key !== " ") return;

  //   updateCells();
  // };

  // React.useEffect(() => {
  //   window.addEventListener("keypress", handleSpacePress);

  //   return () => {
  //     window.removeEventListener("keypress", handleSpacePress);
  //   };
  // });

  // === === === === === === === //

  const renderBoard = () => {
    return cells.map(cellRow =>
      cellRow.map(cell => (
        <Cell key={`${cell.row}-${cell.col}`} cell={cell} blocks={blocks} />
      )),
    );
  };

  updateCells();

  return (
    <div
      //@ts-expect-error sending custom css variable.
      style={{ "--board-size": `${BOARD_SIZE}px` }}
      className={classes["root"]}
    >
      {renderBoard()}
    </div>
  );
};

export default Board;
