export class BinaryHeap<T> {
  content: { priority: number; value: T }[] = [];

  enqueue(value: T, priority: number) {
    this.content.push({ priority, value });
    this.bubbleUp(this.content.length - 1);
  }

  dequeue(): { priority: number; value: T } {
    const result = this.content[0];
    const end = this.content.pop();

    if (this.content.length > 0) {
      this.content[0] = end!;
      this.sinkDown(0);
    }

    return result;
  }

  isEmpty() {
    return this.content.length === 0;
  }

  private bubbleUp(n: number) {
    // Fetch the element that has to be moved.
    const element = this.content[n];
    const score = element.priority;

    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      const parentN = Math.floor((n + 1) / 2) - 1;
      const parent = this.content[parentN];

      // If the parent has a lesser score, things are in order and we
      // are done.
      if (score >= parent.priority) {
        break;
      }

      // Otherwise, swap the parent with the current element and
      // continue.
      this.content[parentN] = element;
      this.content[n] = parent;
      n = parentN;
    }
  }

  private sinkDown(n: number) {
    // Look up the target element and its score.
    const length = this.content.length;
    const element = this.content[n];
    const elemScore = element.priority;

    while (true) {
      // Compute the indices of the child elements.
      const child2N = (n + 1) * 2;
      const child1N = child2N - 1;

      // This is used to store the new position of the element,
      // if any.
      let swap = null;

      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        const child1 = this.content[child1N];
        // If the score is less than our element's, we need to swap.
        if (child1.priority < elemScore) {
          swap = child1N;
        }
      }

      // Do the same checks for the other child.
      if (child2N < length) {
        const child2 = this.content[child2N];

        if (
          child2.priority <
          (swap == null ? elemScore : this.content[child1N].priority)
        ) {
          swap = child2N;
        }
      }

      // No need to swap further, we are done.
      if (swap == null) break;

      // Otherwise, swap and continue.
      this.content[n] = this.content[swap];
      this.content[swap] = element;
      n = swap;
    }
  }
}
