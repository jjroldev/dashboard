import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useState, useEffect } from 'react';

export default function ControlWeather({
    items,
    onVariableChange,
}: {
    items: { name: string; description: string }[];
    onVariableChange: (index: number) => void;
}) {
    const [selected, setSelected] = useState(0);

    useEffect(() => {
        onVariableChange(selected);
    }, [selected, onVariableChange]);

    const handleChange = (event: SelectChangeEvent) => {
        const index = parseInt(event.target.value);
        setSelected(index);
        onVariableChange(index);
    };

    return (
        <Paper
            sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Typography mb={2} component="h3" variant="h6" color="primary">
                Variables Meteorológicas
            </Typography>

            <Box sx={{ minWidth: 120 }}>
                <FormControl fullWidth>
                    <InputLabel id="simple-select-label">Variables</InputLabel>
                    <Select
                        labelId="simple-select-label"
                        id="simple-select"
                        value={selected.toString()}
                        label="Variables"
                        onChange={handleChange}
                    >
                        {items.map((item, index) => (
                            <MenuItem key={index} value={index}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Mostrar descripción basada en la selección */}
            <Typography mt={2} component="p" color="text.secondary">
                {items[selected]?.description}
            </Typography>
        </Paper>
    );
}
