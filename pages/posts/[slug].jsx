import { GraphQLClient, gql } from "graphql-request";

import styles from "@/styles/Slug.module.css";
import moment from "moment";
import Head from "next/head";

const graphcms = new GraphQLClient(process.env.NEXT_PUBLIC_HYGRAPH_MASTER_KEY);

const QUERY = gql`
  query Post($slug: String!) {
    post(where: { slug: $slug }) {
      id
      title
      slug
      datePublished
      author {
        id
        name
        avatar {
          url
        }
      }
      content {
        html
      }
      coverPhoto {
        id
        url
      }
    }
  }
`;

const SLUGLIST = gql`
  {
    posts {
      slug
    }
  }
`;

export async function getStaticPaths() {
  const { posts } = await graphcms.request(SLUGLIST);

  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const slug = params.slug;
  const data = await graphcms.request(QUERY, { slug });
  const post = data.post;

  return {
    props: {
      post,
    },
    revalidate: 30,
  };
}

export default function BlogPost({ post }) {
  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.blog}>
        {/* <img
          className={styles.cover}
          src={post.coverPhoto.url}
          alt={post.title}
        /> */}
        <div className={styles.title}>
          <div className={styles.authdetails}>
            {/* <img src={post.author.avatar.url} alt={post.author.name} /> */}
            <div className={styles.authtext}>
              <h6>By {post.author.name} </h6>
              <h6 className={styles.date}>
                {moment(post.datePublished).format("MMMM d, YYYY")}
              </h6>
            </div>
          </div>
          <h2>{post.title}</h2>
        </div>

        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: post.content.html }}
        ></div>
      </main>
    </>
  );
}
