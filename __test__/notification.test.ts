describe("Notification Routing Logic", () => {
  function getReceivers(tags: string[], orgUserIds: string[], uploaderId: string) {
    if (tags.length > 0) {
      return tags;
    }
    return orgUserIds.filter((id) => id !== uploaderId);
  }

  it("should send direct notification to tagged users only", () => {
    const tags = ["user1", "user2"];
    const orgUsers = ["user1", "user2", "user3", "uploader"];
    const receivers = getReceivers(tags, orgUsers, "uploader");

    expect(receivers).toEqual(["user1", "user2"]);
  });

  it("should broadcast to all org users except uploader when no tags", () => {
    const tags: string[] = [];
    const orgUsers = ["user1", "user2", "user3", "uploader"];
    const receivers = getReceivers(tags, orgUsers, "uploader");

    expect(receivers).toEqual(["user1", "user2", "user3"]);
  });

  it("should not include uploader in broadcast", () => {
    const tags: string[] = [];
    const orgUsers = ["uploader"];
    const receivers = getReceivers(tags, orgUsers, "uploader");

    expect(receivers).toEqual([]);
  });
});