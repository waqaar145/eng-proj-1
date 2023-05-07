import { DateWihtoutTime } from './../../../src/utils/date'

export const convertMessagesArrayToObjectForm = (messages) => {
  // CONVERTING MESSAGES OBJECT TO DATE WISE MESSAGES OBJECT
  let updatedMessages = {};
  let prevMessage = null;
  for (const [key, value] of Object.entries(messages)) {
    if (!prevMessage) {
      updatedMessages = { ...updatedMessages, [key]: value };
      prevMessage = value;
    } else {
      if (
        prevMessage.userId === value.userId &&
        DateWihtoutTime(prevMessage.createdAt) ===
          DateWihtoutTime(value.createdAt)
      ) {
        updatedMessages = {
          ...updatedMessages,
          [prevMessage.id]: {
            ...updatedMessages[prevMessage.id],
            groupedMessages:
              "groupedMessages" in updatedMessages[prevMessage.id]
                ? {
                    ...updatedMessages[prevMessage.id].groupedMessages,
                    [value.id]: value,
                  }
                : { [value.id]: value },
          },
        };
      } else {
        updatedMessages = { ...updatedMessages, [key]: value };
        prevMessage = value;
      }
    }
  }

  return updatedMessages;
};
