
const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c',
    'Content-Type': 'application/json'
};

const baseUrl = 'https://qfvmqotkhjkewdwzibyb.supabase.co/rest/v1';

async function deleteProduct(id) {
    try {
        const url = `${baseUrl}/finished_goods?id=eq.${id}`;
        const res = await fetch(url, {
            method: 'DELETE',
            headers
        });

        if (res.status === 204) {
            console.log(`Successfully deleted product ID: ${id}`);
        } else {
            const text = await res.text();
            console.log(`Failed to delete. Status: ${res.status}, Body: ${text}`);
        }
    } catch (error) {
        console.error(error);
    }
}

// Delete ID 9 (Old Black Goat)
deleteProduct(9);
