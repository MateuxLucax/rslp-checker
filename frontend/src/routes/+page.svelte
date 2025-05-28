<script lang="ts">
  import { onMount } from 'svelte';

  interface RSLPResult {
    originalWord: string;
    stemmedWord: string;
  };

  let word = $state('');
  let results: RSLPResult[] = $state([]);
  let isProcessing = $state(false);

  onMount(() => {
    document.title = 'RSLP - Word Stemmer';
  });

  async function stemWord() {
    if (!word.length) {
      alert('Please enter a word to process.');
      return;
    }

    isProcessing = true;
    
    try {
      const response = await fetch('/api/stem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: word })
      });

      if (!response.ok) {
        throw new Error('Error processing the word');
      }

      const data = await response.json();
      results.unshift({
        originalWord: word,
        stemmedWord: data.stemmed || ''
      });

      word = '';
    } catch (error) {
      alert('Error processing the word. Please try again.');
      console.error(error);
    } finally {
      isProcessing = false;
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      stemWord();
    }
  }
</script>

<div class="min-h-screen bg-gray-50 flex flex-col">
  <!-- Header -->
  <header class="bg-white shadow-sm">
    <div class="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900">RSLP - Word Stemmer</h1>
    </div>
  </header>

  <!-- Main content -->
  <main class="flex-1">
    <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <!-- Description -->
        <div class="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <p class="text-sm text-gray-600">
            The RSLP algorithm (Portuguese Language Suffix Remover) reduces words to their basic forms,
            removing suffixes and prefixes, facilitating linguistic analysis and text searches.
          </p>
        </div>

        <!-- Input section -->
        <div class="px-6 py-5">
          <div class="flex space-x-2">
            <input 
              type="text" 
              placeholder="Enter a word..." 
              bind:value={word} 
              onkeydown={handleKeyDown}
              class="flex-1 px-4 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button 
              onclick={stemWord} 
              disabled={isProcessing || !word.length}
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isProcessing}
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              {:else}
                Stem
              {/if}
            </button>
          </div>
        </div>

        <!-- Results section -->
        <div class="px-6 py-5 bg-gray-50">
          {#if results.length > 0}
            <h2 class="text-lg font-medium text-gray-900 mb-4">Results History</h2>
            <div class="space-y-4">
              {#each results as result, i (i)}
                <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors">
                  <div class="flex flex-col sm:flex-row sm:justify-between">
                    <div class="mb-2 sm:mb-0">
                      <span class="text-xs text-gray-500">Original word</span>
                      <p class="text-gray-900 font-medium">{result.originalWord}</p>
                    </div>
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mx-2 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                    <div>
                      <span class="text-xs text-gray-500">Stemmed root</span>
                      <p class="text-blue-600 font-medium">{result.stemmedWord}</p>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-1">No results yet</h3>
              <p class="text-sm text-gray-500 max-w-md mx-auto">
                Enter a word in the field above and click "Stem" to see how the RSLP algorithm transforms words into their root forms.
              </p>
              <div class="mt-6 border-t border-b border-gray-200 py-4">
                <p class="text-sm text-gray-600 italic">Example: "caminhando" → "caminh"</p>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="bg-white border-t border-gray-200">
    <div class="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <p class="text-xs text-center text-gray-500">
        RSLP - Portuguese Language Suffix Remover.
      </p>
    </div>
  </footer>
</div>
