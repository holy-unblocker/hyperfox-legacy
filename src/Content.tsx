import type { ReactNode } from "react";
import { forwardRef, useImperativeHandle, useState } from "react";
import styles from "./styles/Tabs.module.scss";

export interface RenderBackend {
  title: string;
}

export const SystemTab = forwardRef<
  RenderBackend,
  { title: string; icon?: string; children: ReactNode }
>(({ title, children }, ref) => {
  useImperativeHandle(
    ref,
    () => ({
      title,
    }),
    [title]
  );

  return <div className={styles.systemTab}>{children}</div>;
});

const WebContent = forwardRef<RenderBackend, { src: string }>(
  ({ src }, ref) => {
    const [title] = useState(src);

    useImperativeHandle(
      ref,
      () => ({
        title,
      }),
      [title]
    );

    // eslint-disable-next-line jsx-a11y/iframe-has-title
    return <iframe src={src} />;
  }
);

export default WebContent;
