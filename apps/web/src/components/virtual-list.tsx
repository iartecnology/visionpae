'use client';

import { List } from 'react-window';
import type { CSSProperties, ReactElement } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number, style: CSSProperties) => React.ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function VirtualList<T>({ items, itemHeight, renderItem, style, className }: VirtualListProps<T>) {
  return (
    <List
      rowComponent={({ index, style: rowStyle }: any) => renderItem(items[index], index, rowStyle) as ReactElement | null}
      rowCount={items.length}
      rowHeight={itemHeight}
      rowProps={{} as any}
      style={{ height: '100%', ...style }}
      className={className}
    />
  );
}
