import React, { useMemo } from "react";
import { View } from "react-native";
import { UserIcon } from "react-native-heroicons/outline";
import { SafeAreaView } from "react-native-safe-area-context";
import { Conversation, ConversationPreviewList } from "@/app/(dashboard)/_components/conversationPreviewList";
import { useMailbox } from "@/components/mailboxContext";
import { api } from "@/utils/api";
import { cssIconInterop } from "@/utils/css";
import { Header } from "../_components/header";
import { TabBar } from "../_components/tabBar";

cssIconInterop(UserIcon);

export default function AssignedScreen() {
  const { selectedMailbox } = useMailbox();

  const params = useMemo(
    () => ({
      mailboxSlug: selectedMailbox?.slug ?? "",
      category: "assigned",
      sort: "oldest",
      search: null,
      status: null,
      limit: 25,
    }),
    [selectedMailbox?.slug],
  );

  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.mailbox.conversations.listWithPreview.useInfiniteQuery(params, {
      enabled: !!selectedMailbox?.slug,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
  const utils = api.useUtils();

  const conversations = data?.pages.flatMap((page) => page.conversations) || [];

  const handleUpdate = (conversation: Conversation) => {
    utils.mailbox.conversations.listWithPreview.setInfiniteData(params, (data) => {
      if (!data) return undefined;
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          conversations: page.conversations.map((c) => (c.id === conversation.id ? conversation : c)),
        })),
      };
    });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="py-3">
        <Header />
      </View>
      <View className="flex-1">
        <ConversationPreviewList
          conversations={conversations}
          onUpdate={handleUpdate}
          onRefresh={refetch}
          isRefreshing={isRefetching}
          isLoading={isLoading}
          mailboxSlug={selectedMailbox?.slug ?? ""}
          onLoadMore={handleLoadMore}
          hasMore={!!hasNextPage}
          isLoadingMore={isFetchingNextPage}
        />
      </View>
      <TabBar />
    </SafeAreaView>
  );
}
