import React from "react";

export function useChatScroll(dep) {
  const ref = React.useRef(null);

  React.useLayoutEffect(() => {
    const node = ref.current;
    if (node) {
      const shouldScroll =
        node.scrollTop + node.clientHeight + 20 >= node.scrollHeight;

      if (shouldScroll) {
        node.scrollTo({
          top: node.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [dep]); // The effect runs whenever the dependency 'dep' changes.

  return ref;
}
