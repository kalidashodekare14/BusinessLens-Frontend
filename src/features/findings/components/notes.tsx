"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGetFindingQuery, useAddFindingNoteMutation, useDeleteFindingNoteMutation } from "@/features/findings/findings-api";
import { useSelector } from "react-redux";
import { selectCurrentOrgId } from "@/store/org-slice";
import { selectCurrentUser } from "@/store/auth-slice";
import { formatDate } from "@/lib/format";
import { Trash2 } from "lucide-react";

export function Notes({ findingId }: { findingId: string }) {
  const orgId = useSelector(selectCurrentOrgId);
  const currentUser = useSelector(selectCurrentUser);
  const { data: finding } = useGetFindingQuery({ organizationId: orgId!, findingId }, { skip: !orgId, pollingInterval: 2000 });
  const notes = finding?.notes ?? [];
  const [addNote, { isLoading: adding }] = useAddFindingNoteMutation();
  const [deleteNote] = useDeleteFindingNoteMutation();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!content.trim()) {
      setError("Note is required");
      return;
    }
    try {
      await addNote({ organizationId: orgId!, findingId, body: content.trim() }).unwrap();
      setContent("");
    } catch (err: any) {
      setError(err?.data?.message || "Failed to add note");
    }
  };

  const canDelete = (note: any) => {
    if (!currentUser) return false;
    return note.authorId === currentUser.id;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            notes.map((note: any) => (
              <div key={note.id} className="border rounded-md p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{note.authorName || "Unknown"}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                    {canDelete(note) && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => deleteNote({ organizationId: orgId!, findingId, noteId: note.id })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.body ?? note.content}</p>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a note..."
            rows={3}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" size="sm" disabled={adding}>
            Add note
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}