"use client";

import * as Dialog from "@radix-ui/react-dialog";

interface InfoDialogProps {
  title: string;
  content: string;
  triggerText: string;
}

export function InfoDialog({ title, content, triggerText }: InfoDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        className="text-sm hover:underline text-left"
        onClick={(e) => e.stopPropagation()} // Prevent parent onClick from firing
      >
        {triggerText}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <Dialog.Title className="text-lg font-bold">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">{content}</Dialog.Description>
          <Dialog.Close className="mt-4 bg-black text-white px-4 py-2 rounded hover:opacity-90">Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
