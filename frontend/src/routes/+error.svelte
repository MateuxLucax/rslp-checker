<script>
  import { page } from '$app/state';
</script>

<div class="min-h-screen w-full flex items-center justify-center bg-gray-50">
  <div class="max-w-md w-full mx-auto px-4 py-12 space-y-8 text-center">
    <!-- 404 Error Icon -->
    <div class="flex flex-col items-center justify-center">
      <svg class="h-24 w-24 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <h1 class="mt-6 text-6xl font-extrabold text-gray-900">404</h1>
    </div>

    <div class="mt-6">
      <h2 class="text-3xl font-bold text-gray-900">Page Not Found</h2>
      <p class="mt-2 text-base text-gray-600">
        {#if page.status === 404}
          Sorry, the page you are looking for does not exist.
        {:else}
          An error occurred: {page.status} {page.error?.message || ''}
        {/if}
      </p>
    </div>

    <!-- Action button -->
    <div class="mt-8 flex justify-center">
      <a href="/" class="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
        <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Back to Home Page
      </a>
    </div>
  </div>
</div>
