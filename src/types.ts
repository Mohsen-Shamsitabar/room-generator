import { type BlockType, type Dimension } from "./enums";

export type BlockId = string;
// ============================================

export type CellT = {
  row: number;
  col: number;
  blockId?: BlockId;
};

export type Block = {
  id: BlockId;
  type: BlockType;
  // dimension: Dimension;
  filledCells: CellT[];
  color: string;
};

// ============================================

export type Blocks = Record<BlockId, Block>;

// like a matrix
/**
 * a b c d
 * e f g h
 */
// each row represents an option
// each col represents a cell

// export type BlockOption = Pick<Block, "dimension"> & CellT;
export type BlockOption = CellT;

export type BlockOptions = Record<Dimension, BlockOption[][]>;
