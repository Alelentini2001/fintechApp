import React from "react";

import { MARGIN } from "./Config";
import Tile from "./Tile";
import SortableList from "./SortableList";
import { View } from "react-native";

const tiles = [
  {
    id: "spent",
  },
  {
    id: "cashback",
  },
  {
    id: "recent",
  },
  {
    id: "cards",
  },
];

const WidgetList = () => {
  return (
    <View
      style={{
        paddingHorizontal: 30,
        marginBottom: 80,
      }}
    >
      <SortableList
        editing={true}
        onDragEnd={(positions) =>
          console.log(JSON.stringify(positions, null, 2))
        }
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((tile, index) => (
          <Tile onLongPress={() => true} key={index + "-" + index} id={index} />
        ))}
      </SortableList>
    </View>
  );
};

export default WidgetList;
