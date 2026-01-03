
import { getAllPosts, getPostBySlug } from '../lib/blog';

console.log("Verifying Blog Functionality...");

const posts = getAllPosts();
console.log(`Found ${posts.length} posts.`);
posts.forEach(post => {
    console.log(`- ${post.title} (${post.slug})`);
});

if (posts.length > 0) {
    const firstSlug = posts[0].slug;
    console.log(`Attempting to fetch post by slug: ${firstSlug}`);
    const post = getPostBySlug(firstSlug);
    if (post) {
        console.log("Success: Post found.");
    } else {
        console.error("Error: Post not found via getPostBySlug.");
    }

    // specific test for what user might be facing
    const invalidSlug = "singpost";
    const invalidPost = getPostBySlug(invalidSlug);
    if (!invalidPost) {
        console.log(`Confirmed: '${invalidSlug}' correctly returns null.`);
    } else {
        console.error(`Error: '${invalidSlug}' returned a post??`);
    }
} else {
    console.warn("No posts found to test getPostBySlug.");
}
