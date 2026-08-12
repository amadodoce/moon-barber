import { getSql } from "@/lib/neon-sql";

export default function CommentsPage() {
  async function create(formData: FormData) {
    "use server";
    const sql = getSql();
    const comment = formData.get("comment");
    await sql`INSERT INTO comments (comment) VALUES (${comment})`;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Comments</h1>
      <form action={create} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="write a comment"
          name="comment"
          className="rounded border px-3 py-2"
        />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Submit
        </button>
      </form>
    </main>
  );
}
