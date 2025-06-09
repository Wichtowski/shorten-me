import { redirect } from 'next/navigation';
import { getUrlsContainer, getAnonymousContainer } from '../api/utils/cosmos';

async function getOriginalUrl(slug: string) {
  try {
    // Try to find the URL in both containers
    const containers = [await getUrlsContainer(), await getAnonymousContainer()];
    
    for (const container of containers) {
      try {
        // Use a cross-partition query since we're searching by short_url
        const query = {
          query: 'SELECT * FROM c WHERE c.short_url = @short_url',
          parameters: [{ name: '@short_url', value: slug }],
          enableCrossPartitionQuery: true // Enable cross-partition query
        };
        
        const { resources } = await container.items.query(query).fetchAll();
        
        if (resources.length > 0) {
          const urlDoc = resources[0];
          console.log('Found URL document:', urlDoc);
          
          // Update click count
          urlDoc.clicks += 1;
          try {
            await container.item(urlDoc.id, urlDoc.user_id).replace(urlDoc);
            console.log('Updated click count for URL:', urlDoc.short_url);
          } catch (updateError) {
            console.error('Error updating click count:', updateError);
            // Continue with redirect even if click count update fails
          }
          
          return urlDoc.original_url;
        }
      } catch (containerError) {
        console.error('Error querying container:', containerError);
        // Continue to next container if one fails
        continue;
      }
    }
    
    console.log('No URL found for slug:', slug);
    return null;
  } catch (error) {
    console.error('Error in getOriginalUrl:', error);
    return null;
  }
}

export default async function RedirectPage({ params }: { params: { slug: string } }) {
  console.log('Redirecting for slug:', params.slug);
  const originalUrl = await getOriginalUrl(params.slug);
  
  if (!originalUrl) {
    console.log('No URL found, redirecting to 404');
    redirect('/404'); // Redirect to 404 page if URL not found
  }
  
  console.log('Redirecting to:', originalUrl);
  redirect(originalUrl);
} 