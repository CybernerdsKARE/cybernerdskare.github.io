const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

app.post('/api/register', async (req, res) => {
    try {
        const { teamData } = req.body;
        
        // Insert into Supabase
        const { data, error } = await supabase
            .from('team_registrations')
            .insert([teamData]);

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: 'Registration successful',
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 