import { CELL_SIZE } from "../../../../config";
import { BlockType } from "../../../../enums";
import { type Blocks, type CellT } from "../../../../types";
import classes from "./styles.module.css";

type Props = {
  cell: CellT;
  blocks: Blocks;
};

const Cell = (props: Props) => {
  const { cell, blocks } = props;

  if (!cell.blockId) {
    return (
      <div
        id={`${cell.row}-${cell.col}`}
        // @ts-expect-error sending variable.
        style={{ "--cell-size": `${CELL_SIZE}px` }}
        className={classes["root"]}
      ></div>
    );
  }

  const cellBlock = blocks[cell.blockId]!;

  const renderCellText = () => {
    switch (cellBlock.type) {
      case BlockType.START: {
        return "S";
      }
      case BlockType.END: {
        return "E";
      }
      default:
        return;
    }
  };

  return (
    <div
      id={`${cell.row}-${cell.col}`}
      style={{
        // @ts-expect-error sending variable.
        "--background-color": cellBlock.color,
        "--cell-size": `${CELL_SIZE}px`,
      }}
      className={classes["root"]}
    >
      {renderCellText()}
    </div>
  );
};

export default Cell;
