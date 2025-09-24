import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    MessageSquare,
    Phone,
    Mail,
    Clock,
    CheckCircle,
    AlertCircle,
    HelpCircle,
    Send
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';

interface SupportTicket {
    id: string;
    subject: string;
    message: string;
    status: 'open' | 'in_progress' | 'resolved';
    priority: 'low' | 'medium' | 'high';
    created_at: string;
    order_id?: string;
}

const CustomerSupport: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [newTicket, setNewTicket] = useState<{
        subject: string;
        message: string;
        priority: 'low' | 'medium' | 'high';
        order_id: string;
    }>({
        subject: '',
        message: '',
        priority: 'medium',
        order_id: ''
    });
    const { user } = useAuthStore();
    const { toast } = useToast();

    const handleSubmitTicket = async () => {
        if (!newTicket.subject.trim() || !newTicket.message.trim()) {
            toast({
                title: "Taarifa Pungufu",
                description: "Tafadhali jaza sehemu zote muhimu.",
                variant: "destructive"
            });
            return;
        }

        // In a real app, this would submit to the backend
        const ticket: SupportTicket = {
            id: Date.now().toString(),
            subject: newTicket.subject,
            message: newTicket.message,
            priority: newTicket.priority,
            status: 'open',
            created_at: new Date().toISOString(),
            order_id: newTicket.order_id || undefined
        };

        setTickets(prev => [ticket, ...prev]);
        setNewTicket({ subject: '', message: '', priority: 'medium', order_id: '' });

        toast({
            title: "Tiketi Imetengenezwa",
            description: "Tiketi yako imepokelewa. Tutawasiliana nawe hivi karibuni.",
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_progress': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatStatus = (status: string) => {
        switch (status) {
            case 'open': return 'Imefunguliwa';
            case 'in_progress': return 'Inashughulikiwa';
            case 'resolved': return 'Imetatuliwa';
            default: return status;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg bg-green-600 text-white hover:bg-green-700 z-50"
                >
                    <HelpCircle className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5" />
                        <span>Msaada wa Wateja</span>
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="contact" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="contact">Wasiliana Nasi</TabsTrigger>
                        <TabsTrigger value="tickets">Tiketi Zangu</TabsTrigger>
                        <TabsTrigger value="faq">Maswali Maarufu</TabsTrigger>
                    </TabsList>

                    <TabsContent value="contact" className="space-y-6">
                        {/* Quick Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <Phone className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <h3 className="font-semibold">Piga Simu</h3>
                                    <p className="text-sm text-muted-foreground">+255 123 456 789</p>
                                    <p className="text-xs text-muted-foreground">24/7 Inapatikana</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4 text-center">
                                    <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <h3 className="font-semibold">Email</h3>
                                    <p className="text-sm text-muted-foreground">support@fresh.co.tz</p>
                                    <p className="text-xs text-muted-foreground">Jibu kwa masaa 2</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4 text-center">
                                    <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <h3 className="font-semibold">Masaa ya Kazi</h3>
                                    <p className="text-sm text-muted-foreground">Asubuhi 6 - Usiku 10</p>
                                    <p className="text-xs text-muted-foreground">Kila siku</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Create Support Ticket */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tengeneza Tiketi ya Msaada</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="priority">Kipaumbele</Label>
                                        <select
                                            id="priority"
                                            value={newTicket.priority}
                                            onChange={(e) => setNewTicket(prev => ({
                                                ...prev,
                                                priority: e.target.value as 'low' | 'medium' | 'high'
                                            }))}
                                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="low">Chini - Tatizo dogo</option>
                                            <option value="medium">Wastani - Tatizo la kawaida</option>
                                            <option value="high">Juu - Tatizo kubwa</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="order_id">Namba ya Agizo (si lazima)</Label>
                                        <Input
                                            id="order_id"
                                            value={newTicket.order_id}
                                            onChange={(e) => setNewTicket(prev => ({ ...prev, order_id: e.target.value }))}
                                            placeholder="Kama kuna tatizo la agizo"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="subject">Mada ya Tatizo</Label>
                                    <Input
                                        id="subject"
                                        value={newTicket.subject}
                                        onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                                        placeholder="Eleza tatizo kwa ufupi"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="message">Maelezo Kamili</Label>
                                    <Textarea
                                        id="message"
                                        value={newTicket.message}
                                        onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                                        placeholder="Eleza tatizo lako kwa undani ili tuweze kukusaidia vizuri..."
                                        rows={4}
                                        required
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmitTicket}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Tuma Tiketi
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tickets" className="space-y-4">
                        {tickets.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Huna tiketi za msaada</p>
                                    <p className="text-sm">Tiketi zako za msaada zitaonyeshwa hapa</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {tickets.map((ticket) => (
                                    <Card key={ticket.id}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                                                <div className="flex space-x-2">
                                                    <Badge className={getPriorityColor(ticket.priority)}>
                                                        {ticket.priority.toUpperCase()}
                                                    </Badge>
                                                    <Badge className={getStatusColor(ticket.status)}>
                                                        {formatStatus(ticket.status)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {ticket.message}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Iliyoundwa: {new Date(ticket.created_at).toLocaleString('sw-TZ')}</span>
                                                {ticket.order_id && (
                                                    <span>Agizo: #{ticket.order_id.slice(-8)}</span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="faq" className="space-y-4">
                        <div className="space-y-4">
                            {[
                                {
                                    question: "Je, ninaweza kubadilisha agizo langu baada ya kukagua?",
                                    answer: "Unaweza kubadilisha agizo lako kwa dakika 5 tu baada ya kuliagiza. Baada ya hapo, agizo linakuwa tayari kwa uandaliaji."
                                },
                                {
                                    question: "Ni aina gani za malipo mnayokubali?",
                                    answer: "Tunakubali malipo ya fedha taslimu wakati wa utoaji na Pesa za Simu (M-Pesa, Tigo Pesa, Airtel Money)."
                                },
                                {
                                    question: "Muda wa utoaji ni kiasi gani?",
                                    answer: "Muda wa utoaji ni masaa 2-4 kulingana na eneo lako na kiwango cha mahitaji. Utapokea taarifa za maendeleo."
                                },
                                {
                                    question: "Je, kuna ada ya utoaji?",
                                    answer: "Hakuna ada ya utoaji kwa maagizo ya TZS 50,000 na zaidi. Kwa maagizo chini ya hapo, ada ni TZS 3,000."
                                },
                                {
                                    question: "Ninaweza kufanya nini ikiwa sijaridhishwa na bidhaa?",
                                    answer: "Ikiwa hujaridhishwa, wasiliana nasi kwa masaa 24. Tutakurudishia pesa au kubadilisha bidhaa kulingana na hali."
                                }
                            ].map((faq, index) => (
                                <Card key={index}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start space-x-3">
                                            <HelpCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h3 className="font-semibold text-sm mb-2">{faq.question}</h3>
                                                <p className="text-sm text-muted-foreground">{faq.answer}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerSupport;