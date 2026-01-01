import { NextRequest, NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";

const MXBAI_API_KEY = process.env.MXBAI_API_KEY || "mxb_1vLkstmmwmLYRChv24kljXj7MyNe";
const MXBAI_STORE_ID = process.env.MXBAI_STORE_ID || "5563a996-5cb7-4101-a7e9-cd00126a594";

async function getEmbedding(text: string): Promise<number[] | null> {
    try {
        const response = await fetch("https://api.mxbai.com/v1/embeddings", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${MXBAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                input: text,
                model: "mxbai-embed-large",
            }),
        });

        if (!response.ok) {
            console.error("Embedding API error:", response.statusText);
            return null;
        }

        const data = await response.json();
        return data.data?.[0]?.embedding || null;
    } catch (error) {
        console.error("Error getting embedding:", error);
        return null;
    }
}

function cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (normA * normB);
}

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();

        if (!query || typeof query !== "string") {
            return NextResponse.json(
                { error: "Query is required" },
                { status: 400 }
            );
        }

        // Get query embedding
        const queryEmbedding = await getEmbedding(query);
        if (!queryEmbedding) {
            // Fallback to keyword search if embedding fails
            const posts = getAllPosts();
            const results = posts.filter(post =>
                post.title.toLowerCase().includes(query.toLowerCase()) ||
                post.description.toLowerCase().includes(query.toLowerCase()) ||
                post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
            ).slice(0, 10);

            return NextResponse.json({ results });
        }

        // Get all posts and create embeddings
        const posts = getAllPosts();
        const scoredResults = await Promise.all(
            posts.map(async (post) => {
                // Combine title and description for embedding
                const postText = `${post.title} ${post.description} ${post.tags.join(" ")}`;
                const postEmbedding = await getEmbedding(postText);

                if (!postEmbedding) {
                    return { post, score: 0 };
                }

                const similarity = cosineSimilarity(queryEmbedding, postEmbedding);
                return { post, score: similarity };
            })
        );

        // Sort by similarity score and return top 10
        const results = scoredResults
            .filter(item => item.score > 0.3) // Filter by minimum relevance
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(item => ({
                ...item.post,
                relevanceScore: item.score,
            }));

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json(
            { error: "Search failed" },
            { status: 500 }
        );
    }
}
