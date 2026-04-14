const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://kunnbxdupjdwrvboywan.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bm5ieGR1cGpkd3J2Ym95d2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODEwMzAsImV4cCI6MjA4NTE1NzAzMH0.JGo6wk-fb_Dlq2QoQmGy1yucRAHMipryfa9t2dxt_x0'
)

async function main() {
  const { error: snakeError } = await supabase.from('legal_acceptance_logs').insert({ 
    user_id: '123e4567-e89b-12d3-a456-426614174000', 
    document_version: 'v1.0' 
  })
  console.log("INSERT snake real UUID:", snakeError?.message)
}

main()
