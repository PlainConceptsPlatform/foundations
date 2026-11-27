"use client";

import { Avatar, AvatarFallback } from "@plainconceptsplatform/ui-components/avatar";
import { Bubble, BubbleContent } from "@plainconceptsplatform/ui-components/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageGroup,
} from "@plainconceptsplatform/ui-components/message";
import { Bot } from "lucide-react";

export function MessageDemo() {
  return (
    <MessageGroup className="max-w-md">
      <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarFallback>P</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble variant="tinted">
            <BubbleContent>How do I add the new shadcn components?</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <Avatar>
            <AvatarFallback>
              <Bot />
            </AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble variant="tinted" align="end">
            <BubbleContent>
              Import it from <code>@plainconceptsplatform/ui-components</code>. It uses the Platform
              theme automatically.
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  );
}
