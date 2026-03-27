import { useEffect } from 'react';

interface TawkToWidgetProps {
    propertyId: string;
    widgetId: string;
}

export function TawkToWidget({ propertyId, widgetId }: TawkToWidgetProps) {
    useEffect(() => {
        if (!propertyId || !widgetId || propertyId.includes('REPLACE') || widgetId.includes('REPLACE')) {
            console.warn('Tawk.to widget not loaded: missing valid propertyId or widgetId');
            return;
        }

        // Skip if already loaded
        if (document.getElementById('tawk-to-script')) return;

        const script = document.createElement('script');
        script.id = 'tawk-to-script';
        script.async = true;
        // The src format is: https://embed.tawk.to/{propertyId}/{widgetId}
        script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');

        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(script, firstScript);
        } else {
            document.body.appendChild(script);
        }

    }, [propertyId, widgetId]);

    // Tawk.to injects its own widget into the DOM, so this React component renders nothing.
    return null;
}
