const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const MAX_TEAMS = 25;

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

// Get all problem statements
app.get('/api/problems', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('problem_statements')
            .select('*')
            .order('title');

        if (error) throw error;

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Check registration availability
app.get('/api/registration-status', async (req, res) => {
    try {
        const { count, error } = await supabase
            .from('team_registrations')
            .select('*', { count: 'exact' });

        if (error) throw error;

        res.status(200).json({
            success: true,
            isOpen: count < MAX_TEAMS,
            remainingSlots: MAX_TEAMS - count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Register a team
app.post('/api/register', async (req, res) => {
    const client = await supabase.rest.connection();
    
    try {
        await client.transaction(async (tx) => {
            // Check if registration is still open
            const { count: teamCount } = await tx
                .from('team_registrations')
                .select('*', { count: 'exact' });

            if (teamCount >= MAX_TEAMS) {
                throw new Error('Registration closed: Maximum teams reached');
            }

            const { teamData, problemStatementId } = req.body;

            // Check if problem statement is available
            const { data: problem, error: problemError } = await tx
                .from('problem_statements')
                .select('teams_assigned')
                .eq('id', problemStatementId)
                .single();

            if (problemError) throw problemError;
            if (problem.teams_assigned >= 3) {
                throw new Error('Problem statement no longer available');
            }

            // Update problem statement count
            const { error: updateError } = await tx
                .from('problem_statements')
                .update({ teams_assigned: problem.teams_assigned + 1 })
                .eq('id', problemStatementId);

            if (updateError) throw updateError;

            // Register team
            const { data, error } = await tx
                .from('team_registrations')
                .insert([{ ...teamData, problem_statement_id: problemStatementId }]);

            if (error) throw error;

            res.status(200).json({
                success: true,
                message: 'Registration successful',
                data
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// Initialize problem statements (run once)
// app.get('/api/init-problems', async (req, res) => {
//     try {
//         const problemStatements = [
//             {
//                 title: "Zero-Day Vulnerability Detection System",
//                 description: "Design a system to detect and analyze potential zero-day vulnerabilities in web applications."
//             },
//             {
//                 title: "Blockchain Security Monitor",
//                 description: "Develop a monitoring system for detecting suspicious transactions and smart contract vulnerabilities."
//             },
//             {
//                 title: "IoT Device Security Framework",
//                 description: "Create a security framework for protecting IoT devices from common vulnerabilities and attacks."
//             },
//             {
//                 title: "Network Intrusion Detection System",
//                 description: "Build an AI-powered system to detect and prevent network intrusions in real-time."
//             },
//             {
//                 title: "Secure Password Manager",
//                 description: "Develop a secure password management system with encryption and multi-factor authentication."
//             },
//             {
//                 title: "Mobile App Security Scanner",
//                 description: "Create a tool to scan mobile applications for security vulnerabilities and privacy issues."
//             },
//             {
//                 title: "Secure File Sharing System",
//                 description: "Build an end-to-end encrypted file sharing system with access control mechanisms."
//             },
//             {
//                 title: "Web Application Firewall",
//                 description: "Design a WAF to protect web applications from common attacks like XSS and SQL injection."
//             },
//             {
//                 title: "Security Awareness Training Platform",
//                 description: "Develop an interactive platform to train users about cybersecurity best practices."
//             },
//             {
//                 title: "Malware Analysis Toolkit",
//                 description: "Create tools for analyzing and understanding malware behavior in a safe environment."
//             },
//             {
//                 title: "Cloud Security Monitor",
//                 description: "Build a system to monitor and protect cloud infrastructure from security threats."
//             },
//             {
//                 title: "Secure Communication Protocol",
//                 description: "Design a secure protocol for encrypted communication between distributed systems."
//             },
//             {
//                 title: "Access Control System",
//                 description: "Develop a role-based access control system with audit logging capabilities."
//             },
//             {
//                 title: "Security Incident Response Platform",
//                 description: "Create a platform to manage and coordinate responses to security incidents."
//             },
//             {
//                 title: "Vulnerability Assessment Tool",
//                 description: "Build an automated tool for identifying and reporting security vulnerabilities."
//             }
//         ];

//         const { data, error } = await supabase
//             .from('problem_statements')
//             .insert(problemStatements);

//         if (error) throw error;

//         res.status(200).json({
//             success: true,
//             message: 'Problem statements initialized',
//             data
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 