import React, { useState } from "react";
import InfiniteScrollComponent from "react-infinite-scroll-component";

// Adapted from demo in react-infinite-scroll-component
// https://github.com/ankeetmaini/react-infinite-scroll-component

const style = {
  height: 30,
  border: "1px solid pink",
  margin: 6,
  padding: 8
};

function InfiniteScroll() {
  const [itemCount, setItemCount] = useState(40);

  // mock async API call
  const fetchMore = () => {
    setTimeout(() => {
      setItemCount(itemCount + 20);
    }, 1500);
  };

  const items = [];
  for (let i = 0; i < itemCount; i++) {
    items.push(<div key={i} style={style}>{`Item ${i + 1}`}</div>);
  }

  return (
    <div>
      <InfiniteScrollComponent
        dataLength={itemCount}
        hasMore
        loader={<h4>Loading...</h4>}
        next={fetchMore}
      >
        {items}
      </InfiniteScrollComponent>
    </div>
  );
}

export default InfiniteScroll;
